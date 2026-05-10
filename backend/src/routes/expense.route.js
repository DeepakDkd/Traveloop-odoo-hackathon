import { Router } from "express";
import {
  createExpense,
  getExpenseSummary,
  getExpenses,
} from "../controller/expense.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createExpenseSchema,
  expenseListSchema,
  tripParamSchema,
} from "../validators/api.validators.js";

const router = Router({ mergeParams: true });

router.use(protect);

router.post("/", validate(createExpenseSchema), createExpense);
router.get("/", validate(expenseListSchema), getExpenses);
router.get("/summary", validate(tripParamSchema), getExpenseSummary);

export default router;
