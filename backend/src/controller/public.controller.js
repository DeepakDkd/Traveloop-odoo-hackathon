import prisma from "../lib/prisma.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getPublicTripByToken = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const trip = await prisma.trip.findFirst({
      where: {
        shareToken,
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
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
            notes: true,
          },
          orderBy: {
            order: "asc",
          },
        },
        community: true,
      },
    });

    if (!trip) {
      return sendError(res, 404, "Public trip not found.");
    }

    if (trip.community) {
      await prisma.communityPost.update({
        where: {
          tripId: trip.id,
        },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    }

    const baseUrl = process.env.CLIENT_URL || `${req.protocol}://${req.get("host")}`;

    return sendSuccess(res, 200, {
      trip,
      shareUrl: `${baseUrl}/public/trip/${shareToken}`,
    });
  } catch (error) {
    console.error("[getPublicTripByToken] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
