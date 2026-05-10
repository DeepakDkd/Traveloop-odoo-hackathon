import { Router } from "express";
import {
  getCityById,
  getPopularCities,
  saveCity,
  searchCities,
  unsaveCity,
} from "../controller/city.controller.js";
import { getCityActivities } from "../controller/activity.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { cityActivitiesSchema, cityParamSchema, citySearchSchema } from "../validators/api.validators.js";

const router = Router();

router.get("/search", validate(citySearchSchema), searchCities);
router.get("/popular", getPopularCities);
router.get("/:cityId/activities", protect, validate(cityActivitiesSchema), getCityActivities);
router.get("/:cityId", validate(cityParamSchema), getCityById);
router.post("/:cityId/save", protect, validate(cityParamSchema), saveCity);
router.delete("/:cityId/save", protect, validate(cityParamSchema), unsaveCity);

export default router;
