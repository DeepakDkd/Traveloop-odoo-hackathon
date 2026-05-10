import { Router } from "express";
import {
  getCommunityFeed,
  getCommunityTrip,
  likeCommunityTrip,
  publishTrip,
} from "../controller/community.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { communityTripSchema, publishCommunitySchema } from "../validators/api.validators.js";

const router = Router();

router.get("/", getCommunityFeed);
router.get("/:tripId", validate(communityTripSchema), getCommunityTrip);
router.post("/:tripId/publish", protect, validate(publishCommunitySchema), publishTrip);
router.patch("/:tripId/like", validate(communityTripSchema), likeCommunityTrip);

export default router;
