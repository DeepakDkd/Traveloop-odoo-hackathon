import { Router } from "express";
import {
  addStop,
  getTripStops,
  reorderStops,
} from "../controller/stop.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createStopSchema,
  reorderStopsSchema,
  tripParamSchema,
} from "../validators/api.validators.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.post("/", validate(createStopSchema), addStop);
router.get("/", validate(tripParamSchema), getTripStops);
router.patch("/reorder", validate(reorderStopsSchema), reorderStops);

export default router;
