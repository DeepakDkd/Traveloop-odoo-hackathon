import { Router } from "express";
import { createBudget, getBudget, updateBudget } from "../controller/budget.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { budgetSchema, tripParamSchema, updateBudgetSchema } from "../validators/api.validators.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.post("/", validate(budgetSchema), createBudget);
router.get("/", validate(tripParamSchema), getBudget);
router.patch("/", validate(updateBudgetSchema), updateBudget);

export default router;
