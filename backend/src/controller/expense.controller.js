import prisma from "../lib/prisma.js";
import { getOwnedExpense, getOwnedTrip } from "../utils/access.js";
import { calculateExpenseTotals, summarizeExpenses } from "../utils/calculations.js";
import { sendError, sendSuccess } from "../utils/response.js";

const expenseInclude = {
  stop: {
    include: {
      city: true,
    },
  },
  trip: {
    select: {
      id: true,
      name: true,
    },
  },
};

const buildExpenseData = (body, existing = {}) => {
  const unitCost = body.unitCost ?? body.amount ?? existing.unitCost;
  const quantity = body.quantity ?? existing.quantity ?? 1;
  const taxPercent = body.taxPercent ?? existing.taxPercent ?? 0;
  const discount = body.discount ?? existing.discount ?? 0;
  const totals = calculateExpenseTotals({
    quantity,
    unitCost,
    taxPercent,
    discount,
  });

  return {
    totals,
    description: body.description ?? body.title ?? existing.description,
  };
};

export const createExpense = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    if (req.body.stopId) {
      const stop = await prisma.stop.findFirst({
        where: {
          id: req.body.stopId,
          tripId,
        },
      });

      if (!stop) {
        return sendError(res, 400, undefined, ["stopId must belong to this trip."]);
      }
    }

    const { totals, description } = buildExpenseData(req.body);

    const expense = await prisma.expense.create({
      data: {
        tripId,
        stopId: req.body.stopId || null,
        invoiceNumber: req.body.invoiceNumber || `INV-${tripId.slice(0, 6)}-${Date.now()}`,
        category: req.body.category,
        description,
        quantity: totals.quantity,
        unitCost: totals.unitCost,
        totalCost: totals.totalCost,
        taxPercent: totals.taxPercent,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        isPaid: req.body.isPaid || false,
      },
      include: expenseInclude,
    });

    return sendSuccess(res, 201, expense, "Expense created successfully.");
  } catch (error) {
    console.error("[createExpense] Error:", error);

    if (error.code === "P2002") {
      return sendError(res, 409, "Invoice number already exists.");
    }

    return sendError(res, 500, "Internal server error.");
  }
};

export const getExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const query = req.validated?.query || req.query;

    const expenses = await prisma.expense.findMany({
      where: {
        tripId,
        ...(query.category && { category: query.category }),
        ...(query.isPaid !== undefined && { isPaid: query.isPaid }),
      },
      include: expenseInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    const invoiceGroups = expenses.reduce((groups, expense) => {
      groups[expense.invoiceNumber] = expense;
      return groups;
    }, {});

    return sendSuccess(res, 200, {
      expenses,
      invoices: Object.values(invoiceGroups),
    });
  } catch (error) {
    console.error("[getExpenses] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getExpenseSummary = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const expenses = await prisma.expense.findMany({
      where: {
        tripId,
      },
    });

    const budget = await prisma.budget.findUnique({
      where: {
        tripId,
      },
    });

    const summary = summarizeExpenses(expenses);

    return sendSuccess(res, 200, {
      totalBudget: budget?.totalBudget || 0,
      remainingBudget: (budget?.totalBudget || 0) - summary.totalSpent,
      totalExpenses: expenses.length,
      ...summary,
    });
  } catch (error) {
    console.error("[getExpenseSummary] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await getOwnedExpense(expenseId, req.user.id);

    if (!expense) {
      return sendError(res, 404, "Expense not found.");
    }

    if (req.body.stopId) {
      const stop = await prisma.stop.findFirst({
        where: {
          id: req.body.stopId,
          tripId: expense.tripId,
        },
      });

      if (!stop) {
        return sendError(res, 400, undefined, ["stopId must belong to this trip."]);
      }
    }

    const { totals, description } = buildExpenseData(req.body, expense);

    const updated = await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        ...(req.body.stopId !== undefined && { stopId: req.body.stopId || null }),
        ...(req.body.invoiceNumber !== undefined && { invoiceNumber: req.body.invoiceNumber }),
        ...(req.body.category !== undefined && { category: req.body.category }),
        ...(description !== undefined && { description }),
        quantity: totals.quantity,
        unitCost: totals.unitCost,
        totalCost: totals.totalCost,
        taxPercent: totals.taxPercent,
        discount: totals.discount,
        grandTotal: totals.grandTotal,
        ...(req.body.isPaid !== undefined && { isPaid: req.body.isPaid }),
      },
      include: expenseInclude,
    });

    return sendSuccess(res, 200, updated, "Expense updated successfully.");
  } catch (error) {
    console.error("[updateExpense] Error:", error);

    if (error.code === "P2002") {
      return sendError(res, 409, "Invoice number already exists.");
    }

    return sendError(res, 500, "Internal server error.");
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await getOwnedExpense(expenseId, req.user.id);

    if (!expense) {
      return sendError(res, 404, "Expense not found.");
    }

    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return sendSuccess(res, 200, undefined, "Expense deleted successfully.");
  } catch (error) {
    console.error("[deleteExpense] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
