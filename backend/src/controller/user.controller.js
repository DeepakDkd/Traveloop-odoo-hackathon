import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/response.js";

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  photo: true,
  language: true,
  role: true,
  city: true,
  country: true,
  addInfo: true,
  createdAt: true,
  updatedAt: true,
};

const buildUserStats = async (userId) => {
  const [tripCount, savedCityCount, trips, expenses] = await Promise.all([
    prisma.trip.count({
      where: {
        userId,
      },
    }),
    prisma.savedCity.count({
      where: {
        userId,
      },
    }),
    prisma.trip.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        startDate: true,
        endDate: true,
        coverImage: true,
        _count: {
          select: {
            stops: true,
            expenses: true,
            packingList: true,
            notes: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    }),
    prisma.expense.findMany({
      where: {
        trip: {
          userId,
        },
      },
      select: {
        grandTotal: true,
      },
    }),
  ]);

  const totalSpent = expenses.reduce((sum, expense) => sum + Number(expense.grandTotal || 0), 0);

  return {
    tripCount,
    savedCityCount,
    totalSpent,
    upcomingTrips: trips.filter((trip) => trip.status === "UPCOMING").slice(0, 5),
    tripSummaries: trips,
  };
};

export const getMe = async (req, res) => {
  try {
    const [user, stats] = await Promise.all([
      prisma.user.findUnique({
        where: {
          id: req.user.id,
        },
        select: userSelect,
      }),
      buildUserStats(req.user.id),
    ]);

    return sendSuccess(res, 200, {
      user,
      stats,
    });
  } catch (error) {
    console.error("[getMe] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const updateMe = async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        ...(req.body.firstName !== undefined && { firstName: req.body.firstName }),
        ...(req.body.lastName !== undefined && { lastName: req.body.lastName }),
        ...(req.body.phone !== undefined && { phone: req.body.phone }),
        ...(req.body.language !== undefined && { language: req.body.language }),
        ...(req.body.city !== undefined && { city: req.body.city }),
        ...(req.body.country !== undefined && { country: req.body.country }),
        ...(req.body.addInfo !== undefined && { addInfo: req.body.addInfo }),
      },
      select: userSelect,
    });

    return sendSuccess(res, 200, updated, "Profile updated successfully.");
  } catch (error) {
    console.error("[updateMe] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, undefined, ["photo is required."]);
    }

    const photo = `/${req.file.path.replace(/\\/g, "/")}`;

    const updated = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        photo,
      },
      select: userSelect,
    });

    return sendSuccess(res, 200, updated, "Profile photo uploaded successfully.");
  } catch (error) {
    console.error("[uploadProfilePhoto] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
