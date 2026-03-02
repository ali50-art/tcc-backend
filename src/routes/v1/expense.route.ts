import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import AuthorizeRole from '../../middlewares/authorizeRole';
import validator from '../../validators';

import ExpenseValidator from '../../validators/expense.validator';
import ExpenseController from '../../controllers/v1/expense.controller';
import { RolesEnum } from '../../constants/constants';

// Employee routes
router.get('/expenses', Authorization.Authenticated, ExpenseController.getMyExpenses);
router.get('/expenses/summary', Authorization.Authenticated, ExpenseController.getExpenseSummary);
router.get('/expenses/:id', Authorization.Authenticated, ExpenseController.getExpenseById);
router.post(
  '/expenses',
  Authorization.Authenticated,
  validator(ExpenseValidator.createExpenseSchema),
  ExpenseController.createExpense,
);

// Manager routes
router.get(
  '/manager/expenses/pending',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.manager, RolesEnum.admin]),
  ExpenseController.getPendingExpenses,
);
router.put(
  '/manager/expenses/:id/approve',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.manager, RolesEnum.admin]),
  ExpenseController.approveExpense,
);
router.put(
  '/manager/expenses/:id/reject',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.manager, RolesEnum.admin]),
  validator(ExpenseValidator.rejectExpenseSchema),
  ExpenseController.rejectExpense,
);

export default router;




