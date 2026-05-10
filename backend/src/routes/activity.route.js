import { Router } from "express";
import {
  searchActivities,
} from "../controller/activity.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  activitySearchSchema,
} from "../validators/api.validators.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.get("/search", validate(activitySearchSchema), searchActivities);

export default router;
