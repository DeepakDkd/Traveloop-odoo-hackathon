import { Router } from "express";
import { getTripAnalytics } from "../controller/analytics.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { tripParamSchema } from "../validators/api.validators.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.get("/", validate(tripParamSchema), getTripAnalytics);

export default router;
