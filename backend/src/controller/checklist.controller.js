import prisma from "../lib/prisma.js";
import { getOwnedTrip } from "../utils/access.js";
import { sendError, sendSuccess } from "../utils/response.js";

const categories = [
  "DOCUMENTS",
  "CLOTHING",
  "ELECTRONICS",
  "TOILETRIES",
  "MEDICINE",
  "OTHER",
];

const buildChecklistResponse = (items) => {
  const packedItems = items.filter((item) => item.isPacked).length;

  return {
    items,
    progress: {
      packed: packedItems,
      total: items.length,
      percentage: items.length ? Math.round((packedItems / items.length) * 100) : 0,
    },
  };
};

const validateCategory = (category) => {
  return !category || categories.includes(category);
};

export const getChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const items = await prisma.packingItem.findMany({
      where: {
        tripId,
      },
      orderBy: [
        {
          category: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return sendSuccess(res, 200, buildChecklistResponse(items));
  } catch (error) {
    console.error("[getChecklist] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const createChecklist = async (req, res) => {
  try {
    const { tripId, items } = req.body;

    if (!tripId) {
      return sendError(res, 400, undefined, ["tripId is required."]);
    }

    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, 400, undefined, ["items array is required."]);
    }

    const invalidItem = items.find((item) => !item.name || !validateCategory(item.category));

    if (invalidItem) {
      return sendError(res, 400, undefined, ["Each item requires a name and valid category."]);
    }

    await prisma.packingItem.createMany({
      data: items.map((item) => ({
        tripId,
        name: item.name,
        category: item.category || "OTHER",
        isPacked: Boolean(item.isPacked),
      })),
    });

    const createdItems = await prisma.packingItem.findMany({
      where: {
        tripId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess(res, 201, buildChecklistResponse(createdItems), "Checklist created successfully.");
  } catch (error) {
    console.error("[createChecklist] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const addItem = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name, category, isPacked } = req.body;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    if (!name) {
      return sendError(res, 400, undefined, ["name is required."]);
    }

    if (!validateCategory(category)) {
      return sendError(res, 400, undefined, ["Invalid category."]);
    }

    const item = await prisma.packingItem.create({
      data: {
        tripId,
        name,
        category: category || "OTHER",
        isPacked: Boolean(isPacked),
      },
    });

    return sendSuccess(res, 201, item, "Item added.");
  } catch (error) {
    console.error("[addItem] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const toggleItem = async (req, res) => {
  try {
    const { itemIds, isPacked } = req.body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return sendError(res, 400, "itemIds array is required");
    }

    if (typeof isPacked !== "boolean") {
      return sendError(res, 400, undefined, ["isPacked must be boolean."]);
    }

    const ownedItems = await prisma.packingItem.findMany({
      where: {
        id: {
          in: itemIds,
        },
        trip: {
          userId: req.user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (ownedItems.length !== itemIds.length) {
      return sendError(res, 404, "One or more checklist items were not found.");
    }

    await prisma.packingItem.updateMany({
      where: {
        id: {
          in: itemIds,
        },
        trip: {
          userId: req.user.id,
        },
      },
      data: {
        isPacked,
      },
    });

    const updatedItems = await prisma.packingItem.findMany({
      where: {
        id: {
          in: itemIds,
        },
      },
    });

    return sendSuccess(res, 200, updatedItems, "Items updated successfully");
  } catch (error) {
    console.error("[toggleItem] Error:", error);
    return sendError(res, 500, "Internal server error");
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.packingItem.findFirst({
      where: {
        id: itemId,
        trip: {
          userId: req.user.id,
        },
      },
    });

    if (!item) {
      return sendError(res, 404, "Item not found.");
    }

    await prisma.packingItem.delete({
      where: {
        id: itemId,
      },
    });

    return sendSuccess(res, 200, undefined, "Item deleted.");
  } catch (error) {
    console.error("[deleteItem] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const resetChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    await prisma.packingItem.updateMany({
      where: {
        tripId,
      },
      data: {
        isPacked: false,
      },
    });

    return sendSuccess(res, 200, undefined, "Checklist reset successfully.");
  } catch (error) {
    console.error("[resetChecklist] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};

export const searchItems = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { q, category, isPacked } = req.query;
    const trip = await getOwnedTrip(tripId, req.user.id);

    if (!trip) {
      return sendError(res, 404, "Trip not found.");
    }

    const items = await prisma.packingItem.findMany({
      where: {
        tripId,
        ...(category && { category }),
        ...(isPacked !== undefined && { isPacked: isPacked === "true" }),
        ...(q && {
          name: {
            contains: q,
            mode: "insensitive",
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return sendSuccess(res, 200, items);
  } catch (error) {
    console.error("[searchItems] Error:", error);
    return sendError(res, 500, "Internal server error.");
  }
};
