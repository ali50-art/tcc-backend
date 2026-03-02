import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import AuthorizeRole from '../../middlewares/authorizeRole';
import validator from '../../validators';

import LeaveValidator from '../../validators/leave.validator';
import LeaveController from '../../controllers/v1/leave.controller';
import { RolesEnum } from '../../constants/constants';

// Employee routes
router.get('/leaves', Authorization.Authenticated, LeaveController.getMyLeaves);
router.get('/leaves/balance', Authorization.Authenticated, LeaveController.getLeaveBalance);
router.get('/leaves/:id', Authorization.Authenticated, LeaveController.getLeaveById);
router.post(
  '/leaves',
  Authorization.Authenticated,
  validator(LeaveValidator.createLeaveSchema),
  LeaveController.createLeave,
);

// Manager routes
router.get(
  '/manager/leaves/pending',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.manager, RolesEnum.admin]),
  LeaveController.getPendingLeaves,
);
router.put(
  '/manager/leaves/:id/approve',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.manager, RolesEnum.admin]),
  LeaveController.approveLeave,
);
router.put(
  '/manager/leaves/:id/reject',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.manager, RolesEnum.admin]),
  validator(LeaveValidator.rejectLeaveSchema),
  LeaveController.rejectLeave,
);

export default router;




