// routes/trip.route.js

import express from "express";

import {
  createTrip,
  getTripSuggestions,
  getUserTrips,
  getTripById,
} from "../controller/trip.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createTrip);

router.get("/suggestions", getTripSuggestions);

router.get("/user/all", getUserTrips);

router.get("/:id", getTripById);

export default router;