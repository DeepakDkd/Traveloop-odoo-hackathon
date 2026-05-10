import { Router } from "express";
import { getPublicTripByToken } from "../controller/public.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { shareTokenSchema } from "../validators/api.validators.js";

const router = Router();

router.get("/trip/:shareToken", validate(shareTokenSchema), getPublicTripByToken);

export default router;
