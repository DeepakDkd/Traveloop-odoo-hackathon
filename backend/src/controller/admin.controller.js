import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/response.js";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  photo: true,
  role: true,
  city: true,
  country: true,
  createdAt: true,
  _count: {
    select: {
      trips: true,
      savedCities: true,
    },
  },
};

const roles = ["USER", "ADMIN"];

export const getAdminUsers = async (req, res) => {
  try {
    const { q, role, sort = "createdAt", order = "desc", take = 50 } = req.query;
    const sortableFields = ["createdAt", "firstName", "lastName", "email", "role"];
    const sortField = sortableFields.includes(sort) ? sort : "createdAt";

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role }),
        ...(q && {
          OR: [
            {
              firstName: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              city: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              country: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      select: userSelect,
      orderBy: {
        [sortField]: order === "asc" ? "asc" : "desc",
      },
      take: Number(take),
    });

    return sendSuccess(res, 200, users);
  } catch (error) {
    console.error("[getAdminUsers] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!roles.includes(role)) {
      return sendError(res, 400, undefined, ["Invalid role."]);
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role,
      },
      select: userSelect,
    });

    return sendSuccess(res, 200, user, "User role updated.");
  } catch (error) {
    console.error("[updateUserRole] Error:", error);

    if (error.code === "P2025") {
      return sendError(res, 404, "User not found.");
    }

    return sendError(res, 500, "Internal server error.");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return sendError(res, 400, undefined, ["Admins cannot delete their own account from this endpoint."]);
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return sendSuccess(res, 200, undefined, "User deleted.");
  } catch (error) {
    console.error("[deleteUser] Error:", error);

    if (error.code === "P2025") {
      return sendError(res, 404, "User not found.");
    }

    return sendError(res, 500, "Internal server error.");
  }
};

export const getPopularCitiesReport = async (req, res) => {
  try {
    const { take = 10 } = req.query;

    const stopCounts = await prisma.stop.groupBy({
      by: ["cityId"],
      _count: {
        cityId: true,
      },
      orderBy: {
        _count: {
          cityId: "desc",
        },
      },
      take: Number(take),
    });

    const cityIds = stopCounts.map((item) => item.cityId);
    const cities = await prisma.city.findMany({
      where: {
        id: {
          in: cityIds,
        },
      },
      include: {
        _count: {
          select: {
            stops: true,
            savedBy: true,
            activities: true,
          },
        },
      },
    });

    const data = stopCounts.map((count) => {
      const city = cities.find((item) => item.id === count.cityId);

      return {
        ...city,
        tripStopCount: count._count.cityId,
      };
    });

    return sendSuccess(res, 200, data);
  } catch (error) {
    console.error("[getPopularCitiesReport] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getPopularActivitiesReport = async (req, res) => {
  try {
    const { take = 10 } = req.query;

    const activityCounts = await prisma.stopActivity.groupBy({
      by: ["activityId"],
      _count: {
        activityId: true,
      },
      orderBy: {
        _count: {
          activityId: "desc",
        },
      },
      take: Number(take),
    });

    const activityIds = activityCounts.map((item) => item.activityId);
    const activities = await prisma.activity.findMany({
      where: {
        id: {
          in: activityIds,
        },
      },
      include: {
        city: true,
      },
    });

    const data = activityCounts.map((count) => {
      const activity = activities.find((item) => item.id === count.activityId);

      return {
        ...activity,
        plannedCount: count._count.activityId,
      };
    });

    return sendSuccess(res, 200, data);
  } catch (error) {
    console.error("[getPopularActivitiesReport] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getUserTrends = async (_req, res) => {
  try {
    const [
      userCount,
      tripCount,
      publicTripCount,
      cityCount,
      activityCount,
      tripsByStatus,
      expensesByCategory,
      recentTrips,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.trip.count({
        where: {
          isPublic: true,
        },
      }),
      prisma.city.count(),
      prisma.activity.count(),
      prisma.trip.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
      prisma.expense.groupBy({
        by: ["category"],
        _sum: {
          grandTotal: true,
        },
        _count: {
          category: true,
        },
      }),
      prisma.trip.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      }),
    ]);

    return sendSuccess(res, 200, {
      totals: {
        users: userCount,
        trips: tripCount,
        publicTrips: publicTripCount,
        cities: cityCount,
        activities: activityCount,
      },
      tripsByStatus,
      expensesByCategory,
      recentTrips,
    });
  } catch (error) {
    console.error("[getUserTrends] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
