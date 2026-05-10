import prisma from "../lib/prisma.js";
import { getOwnedTrip } from "../utils/access.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const uploadTripCover = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    if (!req.file) {
      return sendError(res, 400, undefined, ["coverImage is required."]);
    }

    const coverImage = `/${req.file.path.replace(/\\/g, "/")}`;

    const updated = await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        coverImage,
      },
    });

    return sendSuccess(res, 200, updated, "Trip cover uploaded successfully.");
  } catch (error) {
    console.error("[uploadTripCover] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
