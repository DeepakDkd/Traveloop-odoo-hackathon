import prisma from "../lib/prisma.js";
import { getOwnedStop } from "../utils/access.js";
import { sendError, sendSuccess } from "../utils/response.js";

const activityInclude = {
  activity: {
    include: {
      city: true,
    },
  },
};

export const searchActivities = async (req, res) => {
  try {
    const { q, cityId, category, take = 20 } = req.query;

    const activities = await prisma.activity.findMany({
      where: {
        ...(cityId && { cityId }),
        ...(category && { category }),
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
          ],
        }),
      },
      include: {
        city: true,
      },
      orderBy: {
        name: "asc",
      },
      take: Number(take),
    });

    return sendSuccess(res, 200, activities);
  } catch (error) {
    console.error("[searchActivities] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getCityActivities = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { category, take = 20 } = req.query;

    const city = await prisma.city.findUnique({
      where: {
        id: cityId,
      },
    });

    if (!city) {
      return sendError(res, 404, "City not found.");
    }

    const activities = await prisma.activity.findMany({
      where: {
        cityId,
        ...(category && { category }),
      },
      include: {
        city: true,
      },
      orderBy: [
        {
          category: "asc",
        },
        {
          name: "asc",
        },
      ],
      take: Number(take),
    });

    return sendSuccess(res, 200, {
      city,
      activities,
    });
  } catch (error) {
    console.error("[getCityActivities] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const addActivityToStop = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = await getOwnedStop(stopId, req.user.id);

    if (!stop) {
      return sendError(res, 404, "Stop not found.");
    }

    const { activityId, scheduledAt, notes } = req.body;
    let finalActivityId = activityId;

    if (scheduledAt) {
      const scheduleDate = new Date(scheduledAt);

      if (scheduleDate < stop.startDate || scheduleDate > stop.endDate) {
        return sendError(res, 400, undefined, ["scheduledAt must be inside stop date range."]);
      }
    }

    if (activityId) {
      const activity = await prisma.activity.findFirst({
        where: {
          id: activityId,
          cityId: stop.cityId,
        },
      });

      if (!activity) {
        return sendError(res, 404, "Activity not found for this stop city.");
      }
    } else {
      if (!req.body.name) {
        return sendError(res, 400, undefined, ["name is required when activityId is not provided."]);
      }

      const activity = await prisma.activity.create({
        data: {
          cityId: stop.cityId,
          name: req.body.name,
          description: req.body.description || null,
          category: req.body.category || "OTHER",
          cost: req.body.cost ?? null,
          duration: req.body.duration ?? null,
          imageUrl: req.body.imageUrl || null,
        },
      });

      finalActivityId = activity.id;
    }

    const stopActivity = await prisma.stopActivity.upsert({
      where: {
        stopId_activityId: {
          stopId,
          activityId: finalActivityId,
        },
      },
      update: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notes: notes ?? null,
      },
      create: {
        stopId,
        activityId: finalActivityId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        notes: notes ?? null,
      },
      include: activityInclude,
    });

    return sendSuccess(res, 201, stopActivity, "Activity added to stop.");
  } catch (error) {
    console.error("[addActivityToStop] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const getStopActivities = async (req, res) => {
  try {
    const { stopId } = req.params;
    const stop = await getOwnedStop(stopId, req.user.id);

    if (!stop) {
      return sendError(res, 404, "Stop not found.");
    }

    const activities = await prisma.stopActivity.findMany({
      where: {
        stopId,
      },
      include: activityInclude,
      orderBy: {
        scheduledAt: "asc",
      },
    });

    return sendSuccess(res, 200, activities);
  } catch (error) {
    console.error("[getStopActivities] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const removeActivityFromStop = async (req, res) => {
  try {
    const { stopId, activityId } = req.params;
    const stop = await getOwnedStop(stopId, req.user.id);

    if (!stop) {
      return sendError(res, 404, "Stop not found.");
    }

    const stopActivity = await prisma.stopActivity.findUnique({
      where: {
        stopId_activityId: {
          stopId,
          activityId,
        },
      },
    });

    if (!stopActivity) {
      return sendError(res, 404, "Activity is not attached to this stop.");
    }

    await prisma.stopActivity.delete({
      where: {
        stopId_activityId: {
          stopId,
          activityId,
        },
      },
    });

    return sendSuccess(res, 200, undefined, "Activity removed from stop.");
  } catch (error) {
    console.error("[removeActivityFromStop] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
