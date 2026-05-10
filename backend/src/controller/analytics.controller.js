import prisma from "../lib/prisma.js";
import { getOwnedTrip } from "../utils/access.js";
import { summarizeExpenses } from "../utils/calculations.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getTripAnalytics = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const [expenses, packingItems, stops, stopActivities, budget] = await Promise.all([
      prisma.expense.findMany({
        where: {
          tripId,
        },
      }),
      prisma.packingItem.findMany({
        where: {
          tripId,
        },
      }),
      prisma.stop.findMany({
        where: {
          tripId,
        },
        include: {
          city: true,
        },
        orderBy: {
          order: "asc",
        },
      }),
      prisma.stopActivity.findMany({
        where: {
          stop: {
            tripId,
          },
        },
        include: {
          activity: true,
        },
      }),
      prisma.budget.findUnique({
        where: {
          tripId,
        },
      }),
    ]);

    const expenseSummary = summarizeExpenses(expenses);
    const packedCount = packingItems.filter((item) => item.isPacked).length;
    const checklistCompletion = packingItems.length
      ? Math.round((packedCount / packingItems.length) * 100)
      : 0;

    const activitiesByCategory = stopActivities.reduce((totals, item) => {
      const category = item.activity.category;
      totals[category] = (totals[category] || 0) + 1;
      return totals;
    }, {});

    return sendSuccess(res, 200, {
      trip: {
        id: trip.id,
        name: trip.name,
        status: trip.status,
        startDate: trip.startDate,
        endDate: trip.endDate,
      },
      budget: {
        totalBudget: budget?.totalBudget || 0,
        spent: expenseSummary.totalSpent,
        remaining: (budget?.totalBudget || 0) - expenseSummary.totalSpent,
      },
      expenses: expenseSummary,
      checklist: {
        total: packingItems.length,
        packed: packedCount,
        completionPercentage: checklistCompletion,
      },
      itinerary: {
        stopCount: stops.length,
        stops,
      },
      activities: {
        count: stopActivities.length,
        categoryTotals: activitiesByCategory,
      },
    });
  } catch (error) {
    console.error("[getTripAnalytics] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
