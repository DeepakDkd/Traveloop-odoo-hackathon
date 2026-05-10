import prisma from "../lib/prisma.js";
import { getOwnedStop, getOwnedTrip, isDateInsideTrip } from "../utils/access.js";
import { sendError, sendSuccess } from "../utils/response.js";

const stopInclude = {
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
};

export const addStop = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { cityId, startDate, endDate, order, note, notes } = req.body;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return sendError(res, 400, undefined, ["endDate must be after or equal to startDate."]);
    }

    if (!isDateInsideTrip(start, trip) || !isDateInsideTrip(end, trip)) {
      return sendError(res, 400, undefined, ["Stop dates must be inside trip date range."]);
    }

    const city = await prisma.city.findUnique({
      where: {
        id: cityId,
      },
    });

    if (!city) {
      return sendError(res, 404, "City not found.");
    }

    const lastStop = await prisma.stop.findFirst({
      where: {
        tripId,
      },
      orderBy: {
        order: "desc",
      },
    });

    const nextOrder = order ?? (lastStop ? lastStop.order + 1 : 0);

    const stop = await prisma.$transaction(async (tx) => {
      const created = await tx.stop.create({
        data: {
          tripId,
          cityId,
          startDate: start,
          endDate: end,
          order: nextOrder,
        },
      });

      const content = note || notes;

      if (content) {
        await tx.tripNote.create({
          data: {
            tripId,
            stopId: created.id,
            scope: "STOP",
            content,
          },
        });
      }

      return tx.stop.findUnique({
        where: {
          id: created.id,
        },
        include: stopInclude,
      });
    });

    return sendSuccess(res, 201, stop, "Stop added successfully.");
  } catch (error) {
    console.error("[addStop] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getTripStops = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const stops = await prisma.stop.findMany({
      where: {
        tripId,
      },
      include: stopInclude,
      orderBy: {
        order: "asc",
      },
    });

    return sendSuccess(res, 200, stops);
  } catch (error) {
    console.error("[getTripStops] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const updateStop = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = await getOwnedStop(stopId, req.user.id);

    if (!stop) {
      return sendError(res, 404, "Stop not found.");
    }

    const data = {};

    if (req.body.cityId !== undefined) {
      const city = await prisma.city.findUnique({
        where: {
          id: req.body.cityId,
        },
      });

      if (!city) {
        return sendError(res, 404, "City not found.");
      }

      data.cityId = req.body.cityId;
    }

    const start = req.body.startDate !== undefined ? new Date(req.body.startDate) : stop.startDate;
    const end = req.body.endDate !== undefined ? new Date(req.body.endDate) : stop.endDate;

    if (end < start) {
      return sendError(res, 400, undefined, ["endDate must be after or equal to startDate."]);
    }

    if (!isDateInsideTrip(start, stop.trip) || !isDateInsideTrip(end, stop.trip)) {
      return sendError(res, 400, undefined, ["Stop dates must be inside trip date range."]);
    }

    if (req.body.startDate !== undefined) data.startDate = start;
    if (req.body.endDate !== undefined) data.endDate = end;
    if (req.body.order !== undefined) data.order = req.body.order;

    const updated = await prisma.stop.update({
      where: {
        id: stopId,
      },
      data,
      include: stopInclude,
    });

    return sendSuccess(res, 200, updated, "Stop updated successfully.");
  } catch (error) {
    console.error("[updateStop] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const deleteStop = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = await getOwnedStop(stopId, req.user.id);

    if (!stop) {
      return sendError(res, 404, "Stop not found.");
    }

    await prisma.stop.delete({
      where: {
        id: stopId,
      },
    });

    const remainingStops = await prisma.stop.findMany({
      where: {
        tripId: stop.tripId,
      },
      orderBy: {
        order: "asc",
      },
    });

    await prisma.$transaction(
      remainingStops.map((item, index) =>
        prisma.stop.update({
          where: {
            id: item.id,
          },
          data: {
            order: index,
          },
        })
      )
    );

    return sendSuccess(res, 200, undefined, "Stop deleted successfully.");
  } catch (error) {
    console.error("[deleteStop] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const reorderStops = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { stops } = req.body;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const stopIds = stops.map((stop) => stop.stopId);
    const existingStops = await prisma.stop.findMany({
      where: {
        tripId,
        id: {
          in: stopIds,
        },
      },
    });

    if (existingStops.length !== stopIds.length) {
      return sendError(res, 400, undefined, ["All stops must belong to this trip."]);
    }

    await prisma.$transaction(
      stops.map((stop) =>
        prisma.stop.update({
          where: {
            id: stop.stopId,
          },
          data: {
            order: stop.order,
          },
        })
      )
    );

    const updatedStops = await prisma.stop.findMany({
      where: {
        tripId,
      },
      include: stopInclude,
      orderBy: {
        order: "asc",
      },
    });

    return sendSuccess(res, 200, updatedStops, "Itinerary reordered successfully.");
  } catch (error) {
    console.error("[reorderStops] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
