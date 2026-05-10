import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;

    const items = await prisma.packingItem.findMany({
      where: {
        tripId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalItems = items.length;

    const packedItems = items.filter(
      (item) => item.isPacked
    ).length;

    res.status(200).json({
      success: true,
      data: {
        items,
        progress: {
          packed: packedItems,
          total: totalItems,
        },
      },
    });
  } catch (error) {
    console.error("[getChecklist] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const createChecklist = async (req, res) => {
  try {
    const { tripId, items } = req.body;

    if (!tripId) {
      return res.status(400).json({
        success: false,
        errors: ["tripId is required."],
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
        errors: ["Trip not found."],
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        errors: ["items array is required."],
      });
    }

    const createdItems = await prisma.packingItem.createMany({
      data: items.map((item) => ({
        tripId,
        name: item.name,
        category: item.category || "OTHER",
      })),
    });

    res.status(201).json({
      success: true,
      message: "Checklist created successfully.",
      data: createdItems,
    });
  } catch (error) {
    console.error("[createChecklist] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const addItem = async (req, res) => {
  try {
    const { tripId } = req.params;

    const {
      name,
      category,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        errors: ["name is required."],
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

    const item = await prisma.packingItem.create({
      data: {
        tripId,
        name,
        category: category || "OTHER",
      },
    });

    res.status(201).json({
      success: true,
      message: "Item added.",
      data: item,
    });
  } catch (error) {
    console.error("[addItem] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const toggleItem = async (req, res) => {
  try {
    const { itemIds, isPacked } = req.body;

    if (
      !Array.isArray(itemIds) ||
      itemIds.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "itemIds array is required",
      });
    }

    const updatedItems =
      await prisma.packingItem.updateMany({
        where: {
          id: {
            in: itemIds,
          },
        },
        data: {
          isPacked,
        },
      });

    res.status(200).json({
      success: true,
      message: "Items updated successfully",
      data: updatedItems,
    });
  } catch (error) {
    console.error("[toggleItem] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.packingItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    await prisma.packingItem.delete({
      where: {
        id: itemId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Item deleted.",
    });
  } catch (error) {
    console.error("[deleteItem] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const resetChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;

    await prisma.packingItem.updateMany({
      where: {
        tripId,
      },
      data: {
        isPacked: false,
      },
    });

    res.status(200).json({
      success: true,
      message: "Checklist reset successfully.",
    });
  } catch (error) {
    console.error("[resetChecklist] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { tripId } = req.params;

    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        errors: ["Search query is required."],
      });
    }

    const items = await prisma.packingItem.findMany({
      where: {
        tripId,
        name: {
          contains: q,
          mode: "insensitive",
        },
      },
    });

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("[searchItems] Error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};