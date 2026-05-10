import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createTrip = async (req, res) => {
  try {
    const { startDate, endDate, place, userId } = req.body;

    const errors = [];

    if (!startDate) errors.push("startDate is required.");
    if (!endDate) errors.push("endDate is required.");
    if (!place) errors.push("place (destination) is required.");
    if (!userId) errors.push("userId is required.");

    if (errors.length) {
      res.status(400).json({ success: false, errors });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      res.status(400).json({ success: false, errors: ["startDate is not a valid date."] });
      return;
    }

    if (isNaN(end.getTime())) {
      res.status(400).json({ success: false, errors: ["endDate is not a valid date."] });
      return;
    }

    if (end <= start) {
      res.status(400).json({ success: false, errors: ["endDate must be after startDate."] });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, errors: ["User not found."] });
      return;
    }

    const trip = await prisma.trip.create({
      data: {
        startDate: start,
        endDate: end,
        place,
        userId,
        sections: { create: [] },
      },
      include: {
        sections: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({ success: true, message: "Trip created successfully.", data: trip });
  } catch (error) {
    console.error("[createTrip] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getTripSuggestions = async (req, res) => {
  try {
    const { place, startDate, endDate } = req.query;

    if (!place) {
      res.status(400).json({ success: false, errors: ["place query param is required."] });
      return;
    }

    const suggestions = await prisma.suggestion.findMany({
      where: { place: { contains: place, mode: "insensitive" } },
      take: 9,
      orderBy: { rating: "desc" },
    });

    res.status(200).json({
      success: true,
      data: suggestions,
      meta: { place, startDate, endDate, total: suggestions.length },
    });
  } catch (error) {
    console.error("[getTripSuggestions] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      res.status(400).json({ success: false, errors: ["userId is required."] });
      return;
    }

    const trips = await prisma.trip.findMany({
      where: { userId },
      include: { sections: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ success: true, data: trips });
  } catch (error) {
    console.error("[getUserTrips] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        sections: { orderBy: { order: "asc" } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!trip) {
      res.status(404).json({ success: false, message: "Trip not found." });
      return;
    }

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    console.error("[getTripById] Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};