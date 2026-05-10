import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { getOwnedTrip } from "../utils/access.js";

const tripInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      photo: true,
    },
  },
  stops: {
    include: {
      city: true,
      activities: {
        include: {
          activity: true,
        },
        orderBy: {
          scheduledAt: "asc",
        },
      },
      notes: {
        orderBy: {
          createdAt: "desc",
        },
      },
      expenses: true,
    },
    orderBy: {
      order: "asc",
    },
  },
  budget: true,
  expenses: true,
  packingList: true,
  notes: true,
  community: true,
};

const statusValues = ["UPCOMING", "ONGOING", "COMPLETED"];

const createShareUrl = (req, shareToken) => {
  const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl}/public/trip/${shareToken}`;
};

const parseTripDate = (value, field) => {
  if (value === undefined) {
    return undefined;
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return {
      error: `Invalid ${field}`,
    };
  }

  return {
    date,
  };
};

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
      include: tripInclude,
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
    const { place, q, take = 10 } = req.query;
    const search = place || q;

    if (!search) {
      return res.status(400).json({
        success: false,
        errors: ["place or q query param is required"],
      });
    }

    const suggestions = await prisma.trip.findMany({
      where: {
        isPublic: true,
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            stops: {
              some: {
                city: {
                  OR: [
                    {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                    {
                      country: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      take: Number(take),
      orderBy: {
        createdAt: "desc",
      },
      include: tripInclude,
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
    const { q, status, isPublic, sort = "createdAt", order = "desc", groupBy } = req.query;
    const sortableFields = ["createdAt", "startDate", "endDate", "name", "status"];
    const sortField = sortableFields.includes(sort) ? sort : "createdAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const trips = await prisma.trip.findMany({
      where: {
        userId,
        ...(status && { status }),
        ...(isPublic !== undefined && { isPublic: isPublic === "true" }),
        ...(q && {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              stops: {
                some: {
                  city: {
                    name: {
                      contains: q,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        }),
      },
      include: tripInclude,
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    const data = groupBy === "status"
      ? trips.reduce((groups, trip) => {
          groups[trip.status] = groups[trip.status] || [];
          groups[trip.status].push(trip);
          return groups;
        }, {})
      : trips;

    res.status(200).json({
      success: true,
      data,
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

export const getPreplannedTrips = async (req, res) => {
  try {
    const { q, take = 12 } = req.query;

    const trips = await prisma.trip.findMany({
      where: {
        isPreplanned: true,
        isPublic: true,
        ...(q && {
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              stops: {
                some: {
                  city: {
                    name: {
                      contains: q,
                      mode: "insensitive",
                    },
                  },
                },
              },
            },
          ],
        }),
      },
      include: tripInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: Number(take),
    });

    res.status(200).json({
      success: true,
      data: trips,
    });
  } catch (error) {
    console.error("[getPreplannedTrips] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const clonePreplannedTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    const sourceTrip = await prisma.trip.findFirst({
      where: {
        id: tripId,
        isPreplanned: true,
        isPublic: true,
      },
      include: {
        stops: {
          include: {
            activities: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        budget: true,
        packingList: true,
      },
    });

    if (!sourceTrip) {
      return res.status(404).json({
        success: false,
        message: "Preplanned trip not found",
      });
    }

    const clonedTrip = await prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          userId: req.user.id,
          name: sourceTrip.name,
          description: sourceTrip.description,
          coverImage: sourceTrip.coverImage,
          startDate: sourceTrip.startDate,
          endDate: sourceTrip.endDate,
          status: "UPCOMING",
        },
      });

      if (sourceTrip.budget) {
        await tx.budget.create({
          data: {
            tripId: trip.id,
            totalBudget: sourceTrip.budget.totalBudget,
            transportBudget: sourceTrip.budget.transportBudget,
            stayBudget: sourceTrip.budget.stayBudget,
            activityBudget: sourceTrip.budget.activityBudget,
            mealBudget: sourceTrip.budget.mealBudget,
            otherBudget: sourceTrip.budget.otherBudget,
          },
        });
      }

      for (const sourceStop of sourceTrip.stops) {
        const stop = await tx.stop.create({
          data: {
            tripId: trip.id,
            cityId: sourceStop.cityId,
            order: sourceStop.order,
            startDate: sourceStop.startDate,
            endDate: sourceStop.endDate,
          },
        });

        if (sourceStop.activities.length) {
          await tx.stopActivity.createMany({
            data: sourceStop.activities.map((activity) => ({
              stopId: stop.id,
              activityId: activity.activityId,
              scheduledAt: activity.scheduledAt,
              notes: activity.notes,
            })),
          });
        }
      }

      if (sourceTrip.packingList.length) {
        await tx.packingItem.createMany({
          data: sourceTrip.packingList.map((item) => ({
            tripId: trip.id,
            name: item.name,
            category: item.category,
            isPacked: false,
          })),
        });
      }

      return tx.trip.findUnique({
        where: {
          id: trip.id,
        },
        include: tripInclude,
      });
    });

    res.status(201).json({
      success: true,
      message: "Preplanned trip added to your trips",
      data: clonedTrip,
    });
  } catch (error) {
    console.error("[clonePreplannedTrip] Error:", error);

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
      include: tripInclude,
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

export const updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const startResult = parseTripDate(req.body.startDate, "startDate");
    const endResult = parseTripDate(req.body.endDate, "endDate");

    if (startResult?.error || endResult?.error) {
      return res.status(400).json({
        success: false,
        errors: [startResult?.error || endResult?.error],
      });
    }

    const startDate = startResult?.date || trip.startDate;
    const endDate = endResult?.date || trip.endDate;

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        errors: ["endDate must be after startDate"],
      });
    }

    if (req.body.status !== undefined && !statusValues.includes(req.body.status)) {
      return res.status(400).json({
        success: false,
        errors: ["Invalid trip status"],
      });
    }

    const outsideStops = await prisma.stop.count({
      where: {
        tripId,
        OR: [
          {
            startDate: {
              lt: startDate,
            },
          },
          {
            endDate: {
              gt: endDate,
            },
          },
        ],
      },
    });

    if (outsideStops > 0) {
      return res.status(400).json({
        success: false,
        errors: ["Trip dates cannot exclude existing stops"],
      });
    }

    const shouldBePublic = req.body.isPublic;
    const shareToken = shouldBePublic && !trip.shareToken
      ? crypto.randomBytes(16).toString("hex")
      : shouldBePublic === false
        ? null
        : undefined;

    const updated = await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        ...(req.body.name !== undefined && { name: req.body.name }),
        ...(req.body.description !== undefined && { description: req.body.description }),
        ...(req.body.coverImage !== undefined && { coverImage: req.body.coverImage }),
        ...(req.body.status !== undefined && { status: req.body.status }),
        ...(req.body.isPublic !== undefined && { isPublic: req.body.isPublic }),
        ...(shareToken !== undefined && { shareToken }),
        ...(startResult?.date && { startDate }),
        ...(endResult?.date && { endDate }),
      },
      include: tripInclude,
    });

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: {
        ...updated,
        shareUrl: updated.shareToken ? createShareUrl(req, updated.shareToken) : null,
      },
    });
  } catch (error) {
    console.error("[updateTrip] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateTripStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { status } = req.body;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    if (!statusValues.includes(status)) {
      return res.status(400).json({
        success: false,
        errors: ["Invalid trip status"],
      });
    }

    const updated = await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        status,
      },
      include: tripInclude,
    });

    res.status(200).json({
      success: true,
      message: "Trip status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[updateTripStatus] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const shareTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { isPublic = true, caption } = req.body;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    const shareToken = isPublic ? trip.shareToken || crypto.randomBytes(16).toString("hex") : null;

    const updated = await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        isPublic,
        shareToken,
        ...(isPublic && {
          community: {
            upsert: {
              create: {
                caption: caption || null,
              },
              update: {
                caption: caption ?? undefined,
              },
            },
          },
        }),
      },
      include: tripInclude,
    });

    res.status(200).json({
      success: true,
      message: isPublic ? "Trip sharing enabled" : "Trip sharing disabled",
      data: {
        ...updated,
        shareUrl: updated.shareToken ? createShareUrl(req, updated.shareToken) : null,
      },
    });
  } catch (error) {
    console.error("[shareTrip] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found",
      });
    }

    await prisma.trip.delete({
      where: {
        id: tripId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("[deleteTrip] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
