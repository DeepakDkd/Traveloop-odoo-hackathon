import prisma from "../lib/prisma.js";
import { getOwnedTrip } from "../utils/access.js";
import { sendError, sendSuccess } from "../utils/response.js";

const noteInclude = {
  stop: {
    include: {
      city: true,
    },
  },
};

const scopes = ["TRIP", "STOP"];

const validateStop = async (stopId, tripId) => {
  if (!stopId) {
    return true;
  }

  const stop = await prisma.stop.findFirst({
    where: {
      id: stopId,
      tripId,
    },
  });

  return Boolean(stop);
};

export const getNotes = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { scope, sort = "desc", stopId } = req.query;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    if (scope && !scopes.includes(scope)) {
      return sendError(res, 400, undefined, ["Invalid note scope."]);
    }

    const notes = await prisma.tripNote.findMany({
      where: {
        tripId,
        ...(scope && { scope }),
        ...(stopId && { stopId }),
      },
      include: noteInclude,
      orderBy: {
        createdAt: sort === "asc" ? "asc" : "desc",
      },
    });

    return sendSuccess(res, 200, notes);
  } catch (error) {
    console.error("[getNotes] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const createNote = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, content, stopId, scope } = req.body;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    if (!content) {
      return sendError(res, 400, undefined, ["content is required."]);
    }

    if (scope && !scopes.includes(scope)) {
      return sendError(res, 400, undefined, ["Invalid note scope."]);
    }

    const stopIsValid = await validateStop(stopId, tripId);

    if (!stopIsValid) {
      return sendError(res, 400, undefined, ["stopId must belong to this trip."]);
    }

    const note = await prisma.tripNote.create({
      data: {
        tripId,
        title: title || null,
        content,
        stopId: stopId || null,
        scope: scope || (stopId ? "STOP" : "TRIP"),
      },
      include: noteInclude,
    });

    return sendSuccess(res, 201, note, "Note created.");
  } catch (error) {
    console.error("[createNote] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const updateNote = async (req, res) => {
  try {
    const { tripId, noteId } = req.params;
    const { title, content, stopId, scope } = req.body;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const note = await prisma.tripNote.findFirst({
      where: {
        id: noteId,
        tripId,
      },
    });

    if (!note) {
      return sendError(res, 404, "Note not found.");
    }

    if (scope && !scopes.includes(scope)) {
      return sendError(res, 400, undefined, ["Invalid note scope."]);
    }

    const stopIsValid = await validateStop(stopId, tripId);

    if (!stopIsValid) {
      return sendError(res, 400, undefined, ["stopId must belong to this trip."]);
    }

    const updated = await prisma.tripNote.update({
      where: {
        id: noteId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(stopId !== undefined && { stopId: stopId || null }),
        ...(scope !== undefined && { scope }),
      },
      include: noteInclude,
    });

    return sendSuccess(res, 200, updated, "Note updated.");
  } catch (error) {
    console.error("[updateNote] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { tripId, noteId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const note = await prisma.tripNote.findFirst({
      where: {
        id: noteId,
        tripId,
      },
    });

    if (!note) {
      return sendError(res, 404, "Note not found.");
    }

    await prisma.tripNote.delete({
      where: {
        id: noteId,
      },
    });

    return sendSuccess(res, 200, undefined, "Note deleted.");
  } catch (error) {
    console.error("[deleteNote] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const searchNotes = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { q, scope, stopId } = req.query;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const notes = await prisma.tripNote.findMany({
      where: {
        tripId,
        ...(scope && { scope }),
        ...(stopId && { stopId }),
        ...(q && {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              content: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      include: noteInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess(res, 200, notes);
  } catch (error) {
    console.error("[searchNotes] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
