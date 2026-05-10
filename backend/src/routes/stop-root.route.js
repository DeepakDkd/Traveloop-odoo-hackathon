import { Router } from "express";
import {
  addActivityToStop,
  getStopActivities,
  removeActivityFromStop,
} from "../controller/activity.controller.js";
import { deleteStop, updateStop } from "../controller/stop.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  removeStopActivitySchema,
  stopActivitySchema,
  updateStopSchema,
} from "../validators/api.validators.js";

const router = Router();

router.use(protect);

router.patch("/:stopId", validate(updateStopSchema), updateStop);
router.delete("/:stopId", deleteStop);
router.post("/:stopId/activities", validate(stopActivitySchema), addActivityToStop);
router.get("/:stopId/activities", getStopActivities);
router.delete("/:stopId/activities/:activityId", validate(removeStopActivitySchema), removeActivityFromStop);

export default router;
