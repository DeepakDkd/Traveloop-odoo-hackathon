import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const createTrip = async (req, res) => {
  try {
    const {
      name,
      description,
      coverImage,
      startDate,
      endDate,
      isPublic,
    } = req.body;

    const userId = req.user.id;

    const errors = [];

    if (!name) errors.push("name is required.");
    if (!startDate) errors.push("startDate is required.");
    if (!endDate) errors.push("endDate is required.");

    if (errors.length) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime())) {
      return res.status(400).json({
        success: false,
        errors: ["Invalid startDate"],
      });
    }

    if (isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        errors: ["Invalid endDate"],
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        errors: ["endDate must be after startDate"],
      });
    }

    const shareToken = isPublic
      ? crypto.randomBytes(16).toString("hex")
      : null;

    const trip = await prisma.trip.create({
      data: {
        userId,
        name,
        description,
        coverImage,
        startDate: start,
        endDate: end,
        isPublic: isPublic || false,
        shareToken,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        stops: true,
        budget: true,
        expenses: true,
        packingList: true,
        notes: true,
        community: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: trip,
    });
  } catch (error) {
    console.error("[createTrip] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getTripSuggestions = async (req, res) => {
  try {
    const { place } = req.query;

    if (!place) {
      return res.status(400).json({
        success: false,
        errors: ["place query param is required"],
      });
    }

    const suggestions = await prisma.trip.findMany({
      where: {
        isPublic: true,
        name: {
          contains: place,
          mode: "insensitive",
        },
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: suggestions,
    });
  } catch (error) {
    console.error("[getTripSuggestions] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const userId = req.user.id;

    const trips = await prisma.trip.findMany({
      where: {
        userId,
      },
      include: {
        stops: true,
        budget: true,
        expenses: true,
        packingList: true,
        notes: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    console.error("[getUserTrips] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await prisma.trip.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        stops: true,
        budget: true,
        expenses: true,
        packingList: true,
        notes: true,
        community: true,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (
      trip.userId !== req.user.id &&
      !trip.isPublic
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: trip,
    });
  } catch (error) {
    console.error("[getTripById] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};