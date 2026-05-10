import { Router } from "express";
import {
  deleteUser,
  getAdminUsers,
  getPopularActivitiesReport,
  getPopularCitiesReport,
  getUserTrends,
  updateUserRole,
} from "../controller/admin.controller.js";
import { protect, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);
router.use(requireAdmin);

router.get("/users", getAdminUsers);
router.patch("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);
router.get("/popular-cities", getPopularCitiesReport);
router.get("/popular-activities", getPopularActivitiesReport);
router.get("/trends", getUserTrends);

export default router;
