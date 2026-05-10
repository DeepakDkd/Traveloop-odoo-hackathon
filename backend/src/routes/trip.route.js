import express from "express";

import {
  createTrip,
  getTripSuggestions,
  getUserTrips,
  getTripById,
} from "../controller/trip.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";
import { uploadTripCover } from "../controller/trip-media.controller.js";
import analyticsRoutes from "./analytics.route.js";
import budgetRoutes from "./budget.route.js";
import expenseRoutes from "./expense.route.js";
import noteRoutes from "./note.route.js";
import stopRoutes from "./stop.route.js";

const router = express.Router();

router.use(protect);

router.post("/", createTrip);

router.get("/suggestions", getTripSuggestions);

router.get("/user/all", getUserTrips);

router.get("/:id", getTripById);

router.patch("/:tripId/cover", uploadImage.single("coverImage"), uploadTripCover);

router.use("/:tripId/stops", stopRoutes);

router.use("/:tripId/budget", budgetRoutes);

router.use("/:tripId/expenses", expenseRoutes);

router.use("/:tripId/analytics", analyticsRoutes);

router.use("/:tripId/notes", noteRoutes);

export default router;
