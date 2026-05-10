import { Router } from "express";
import { getSavedCities } from "../controller/city.controller.js";
import { getMe, updateMe, uploadProfilePhoto } from "../controller/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadImage } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateProfileSchema } from "../validators/api.validators.js";

const router = Router();

router.use(protect);

router.get("/me", getMe);
router.patch("/me", validate(updateProfileSchema), updateMe);
router.patch("/photo", uploadImage.single("photo"), uploadProfilePhoto);
router.get("/saved-cities", getSavedCities);

export default router;
