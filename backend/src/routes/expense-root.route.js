import { Router } from "express";
import { deleteExpense, updateExpense } from "../controller/expense.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { updateExpenseSchema } from "../validators/api.validators.js";

const router = Router();

router.use(protect);

router.patch("/:expenseId", validate(updateExpenseSchema), updateExpense);
router.delete("/:expenseId", deleteExpense);

export default router;
