import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import AuthorizeRole from '../../middlewares/authorizeRole';
import EmployeeController from '../../controllers/v1/employee.controller';
import { RolesEnum } from '../../constants/constants';

// Employee dashboard routes
router.get(
  '/dashboard',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.employee]),
  EmployeeController.getDashboard
);

router.get(
  '/leave-balance',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.employee]),
  EmployeeController.getLeaveBalance
);

router.get(
  '/tasks',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.employee]),
  EmployeeController.getTasks
);

router.get(
  '/news',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.employee]),
  EmployeeController.getNews
);

export default router;
