import prisma from "../lib/prisma.js";
import { getOwnedTrip } from "../utils/access.js";
import { summarizeExpenses } from "../utils/calculations.js";
import { sendError, sendSuccess } from "../utils/response.js";

const budgetInclude = {
  trip: {
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
    },
  },
};

const buildBudgetResponse = async (tripId, budget, currency = "INR") => {
  const expenses = await prisma.expense.findMany({
    where: {
      tripId,
    },
  });
  const summary = summarizeExpenses(expenses);
  const totalBudget = Number(budget?.totalBudget || 0);

  return {
    budget,
    currency,
    spentAmount: summary.totalSpent,
    remainingAmount: totalBudget - summary.totalSpent,
    categoryTotals: summary.categoryTotals,
    paidTotal: summary.paidTotal,
    unpaidTotal: summary.unpaidTotal,
  };
};

export const createBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        tripId,
      },
    });

    if (existingBudget) {
      return sendError(res, 409, "Budget already exists for this trip.");
    }

    const budget = await prisma.budget.create({
      data: {
        tripId,
        totalBudget: req.body.totalBudget,
        transportBudget: req.body.transportBudget ?? 0,
        stayBudget: req.body.stayBudget ?? 0,
        activityBudget: req.body.activityBudget ?? 0,
        mealBudget: req.body.mealBudget ?? 0,
        otherBudget: req.body.otherBudget ?? 0,
      },
      include: budgetInclude,
    });

    const data = await buildBudgetResponse(tripId, budget, req.body.currency);

    return sendSuccess(res, 201, data, "Budget created successfully.");
  } catch (error) {
    console.error("[createBudget] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const budget = await prisma.budget.findUnique({
      where: {
        tripId,
      },
      include: budgetInclude,
    });

    if (!budget) {
      return sendError(res, 404, "Budget not found.");
    }

    const data = await buildBudgetResponse(tripId, budget, req.query.currency || "INR");

    return sendSuccess(res, 200, data);
  } catch (error) {
    console.error("[getBudget] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const existingBudget = await prisma.budget.findUnique({
      where: {
        tripId,
      },
    });

    if (!existingBudget) {
      return sendError(res, 404, "Budget not found.");
    }

    const budget = await prisma.budget.update({
      where: {
        tripId,
      },
      data: {
        ...(req.body.totalBudget !== undefined && { totalBudget: req.body.totalBudget }),
        ...(req.body.transportBudget !== undefined && { transportBudget: req.body.transportBudget }),
        ...(req.body.stayBudget !== undefined && { stayBudget: req.body.stayBudget }),
        ...(req.body.activityBudget !== undefined && { activityBudget: req.body.activityBudget }),
        ...(req.body.mealBudget !== undefined && { mealBudget: req.body.mealBudget }),
        ...(req.body.otherBudget !== undefined && { otherBudget: req.body.otherBudget }),
      },
      include: budgetInclude,
    });

    const data = await buildBudgetResponse(tripId, budget, req.body.currency);

    return sendSuccess(res, 200, data, "Budget updated successfully.");
  } catch (error) {
    console.error("[updateBudget] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
