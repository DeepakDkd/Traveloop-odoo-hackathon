// routes/checklist.route.js

import express from "express";

import {
  getChecklist,
  createChecklist,
  addItem,
  toggleItem,
  deleteItem,
  resetChecklist,
  searchItems,
} from "../controller/checklist.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/:tripId", getChecklist);

router.post("/", createChecklist);

router.post("/:tripId/item", addItem);

router.patch("/toggle", toggleItem);

router.delete("/item/:itemId", deleteItem);

router.patch("/:tripId/reset", resetChecklist);

router.get("/:tripId/search", searchItems);

export default router;