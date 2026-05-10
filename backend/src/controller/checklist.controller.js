import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;

    const checklist = await prisma.checklist.findUnique({
      where: { tripId },
      include: {
        categories: {
          orderBy: { order: "asc" },
          include: {
            items: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    if (!checklist) {
      res.status(404).json({ success: false, message: "Checklist not found." });
      return;
    }

    const totalItems = checklist.categories.reduce(
      (sum, cat) => sum + cat.items.length, 0
    );
    const packedItems = checklist.categories.reduce(
      (sum, cat) => sum + cat.items.filter((i) => i.isPacked).length, 0
    );

    res.status(200).json({
      success: true,
      data: {
        ...checklist,
        progress: { packed: packedItems, total: totalItems },
      },
    });
  } catch (error) {
    console.error("[getChecklist] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const createChecklist = async (req, res) => {
  try {
    const { tripId } = req.body;

    if (!tripId) {
      res.status(400).json({ success: false, errors: ["tripId is required."] });
      return;
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });

    if (!trip) {
      res.status(404).json({ success: false, errors: ["Trip not found."] });
      return;
    }

    const existing = await prisma.checklist.findUnique({ where: { tripId } });

    if (existing) {
      res.status(409).json({ success: false, errors: ["Checklist already exists for this trip."] });
      return;
    }

    const checklist = await prisma.checklist.create({
      data: { tripId },
      include: { categories: { include: { items: true } } },
    });

    res.status(201).json({ success: true, message: "Checklist created.", data: checklist });
  } catch (error) {
    console.error("[createChecklist] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ success: false, errors: ["name is required."] });
      return;
    }

    const checklist = await prisma.checklist.findUnique({ where: { tripId } });

    if (!checklist) {
      res.status(404).json({ success: false, message: "Checklist not found." });
      return;
    }

    const lastCategory = await prisma.checklistCategory.findFirst({
      where: { checklistId: checklist.id },
      orderBy: { order: "desc" },
    });

    const category = await prisma.checklistCategory.create({
      data: {
        name,
        checklistId: checklist.id,
        order: lastCategory ? lastCategory.order + 1 : 0,
      },
      include: { items: true },
    });

    res.status(201).json({ success: true, message: "Category added.", data: category });
  } catch (error) {
    console.error("[addCategory] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const addItem = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ success: false, errors: ["name is required."] });
      return;
    }

    const category = await prisma.checklistCategory.findUnique({ where: { id: categoryId } });

    if (!category) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }

    const lastItem = await prisma.checklistItem.findFirst({
      where: { categoryId },
      orderBy: { order: "desc" },
    });

    const item = await prisma.checklistItem.create({
      data: {
        name,
        isPacked: false,
        categoryId,
        order: lastItem ? lastItem.order + 1 : 0,
      },
    });

    res.status(201).json({ success: true, message: "Item added.", data: item });
  } catch (error) {
    console.error("[addItem] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const toggleItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });

    if (!item) {
      res.status(404).json({ success: false, message: "Item not found." });
      return;
    }

    const updated = await prisma.checklistItem.update({
      where: { id: itemId },
      data: { isPacked: !item.isPacked },
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("[toggleItem] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });

    if (!item) {
      res.status(404).json({ success: false, message: "Item not found." });
      return;
    }

    await prisma.checklistItem.delete({ where: { id: itemId } });

    res.status(200).json({ success: true, message: "Item deleted." });
  } catch (error) {
    console.error("[deleteItem] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.checklistCategory.findUnique({ where: { id: categoryId } });

    if (!category) {
      res.status(404).json({ success: false, message: "Category not found." });
      return;
    }

    await prisma.checklistCategory.delete({ where: { id: categoryId } });

    res.status(200).json({ success: true, message: "Category deleted." });
  } catch (error) {
    console.error("[deleteCategory] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const resetChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;

    const checklist = await prisma.checklist.findUnique({ where: { tripId } });

    if (!checklist) {
      res.status(404).json({ success: false, message: "Checklist not found." });
      return;
    }

    await prisma.checklistItem.updateMany({
      where: { category: { checklistId: checklist.id } },
      data: { isPacked: false },
    });

    res.status(200).json({ success: true, message: "Checklist reset. All items marked as unpacked." });
  } catch (error) {
    console.error("[resetChecklist] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const shareChecklist = async (req, res) => {
  try {
    const { tripId } = req.params;

    const checklist = await prisma.checklist.findUnique({
      where: { tripId },
      include: {
        categories: {
          orderBy: { order: "asc" },
          include: { items: { orderBy: { order: "asc" } } },
        },
        trip: { select: { place: true, startDate: true, endDate: true } },
      },
    });

    if (!checklist) {
      res.status(404).json({ success: false, message: "Checklist not found." });
      return;
    }

    const totalItems = checklist.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const packedItems = checklist.categories.reduce(
      (sum, cat) => sum + cat.items.filter((i) => i.isPacked).length, 0
    );

    const shareToken = Buffer.from(`${tripId}:${Date.now()}`).toString("base64url");

    const shareableLink = `${process.env.APP_BASE_URL}/shared/checklist/${shareToken}`;

    res.status(200).json({
      success: true,
      data: {
        shareableLink,
        summary: {
          trip: checklist.trip,
          progress: { packed: packedItems, total: totalItems },
          categories: checklist.categories.map((cat) => ({
            name: cat.name,
            items: cat.items.map((i) => ({ name: i.name, isPacked: i.isPacked })),
          })),
        },
      },
    });
  } catch (error) {
    console.error("[shareChecklist] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

export const searchItems = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { q } = req.query;

    if (!q) {
      res.status(400).json({ success: false, errors: ["Search query (q) is required."] });
      return;
    }

    const checklist = await prisma.checklist.findUnique({ where: { tripId } });

    if (!checklist) {
      res.status(404).json({ success: false, message: "Checklist not found." });
      return;
    }

    const items = await prisma.checklistItem.findMany({
      where: {
        name: { contains: q, mode: "insensitive" },
        category: { checklistId: checklist.id },
      },
      include: { category: { select: { name: true } } },
    });

    res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("[searchItems] Error:", error);
    res.status(500).json({ success: false, message: "Internal server error.", error: error.message });
  }
};

