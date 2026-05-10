import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getNotes = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { scope, sort = "desc" } = req.query;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const notes = await prisma.tripNote.findMany({
      where: {
        tripId,
        ...(scope && { scope }),
      },
      include: {
        stop: true,
      },
      orderBy: {
        createdAt: sort,
      },
    });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("[getNotes] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const createNote = async (req, res) => {
  try {
    const { tripId } = req.params;

    const {
      title,
      content,
      stopId,
      scope,
    } = req.body;

    const errors = [];

    if (!content) {
      errors.push("content is required.");
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      },
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const note = await prisma.tripNote.create({
      data: {
        tripId,
        title: title || null,
        content,
        stopId: stopId || null,
        scope: scope || "TRIP",
      },
      include: {
        stop: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Note created.",
      data: note,
    });
  } catch (error) {
    console.error("[createNote] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { tripId, noteId } = req.params;

    const {
      title,
      content,
      stopId,
      scope,
    } = req.body;

    const note = await prisma.tripNote.findFirst({
      where: {
        id: noteId,
        tripId,
      },
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const updated = await prisma.tripNote.update({
      where: {
        id: noteId,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(stopId !== undefined && { stopId }),
        ...(scope !== undefined && { scope }),
      },
      include: {
        stop: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Note updated.",
      data: updated,
    });
  } catch (error) {
    console.error("[updateNote] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { tripId, noteId } = req.params;

    const note = await prisma.tripNote.findFirst({
      where: {
        id: noteId,
        tripId,
      },
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    await prisma.tripNote.delete({
      where: {
        id: noteId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Note deleted.",
    });
  } catch (error) {
    console.error("[deleteNote] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const searchNotes = async (req, res) => {
  try {
    const { tripId } = req.params;

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        errors: ["Search query is required."],
      });
    }

    const notes = await prisma.tripNote.findMany({
      where: {
        tripId,
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
      },
      include: {
        stop: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error("[searchNotes] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};