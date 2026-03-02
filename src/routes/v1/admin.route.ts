import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import AuthorizeRole from '../../middlewares/authorizeRole';
import validator from '../../validators';

import RoleValidator from '../../validators/role.validator';
import RoleController from '../../controllers/v1/role.controller';
import AdminController from '../../controllers/v1/admin.controller';
import { RolesEnum } from '../../constants/constants';

// Admin dashboard
router.get(
  '/admin/stats',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
  AdminController.getDashboardStats,
);

router.get(
  '/admin/audit-logs',
  Authorization.Authenticated,
  AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
  AdminController.getAuditLogs,
);

// Role management
router
  .route('/admin/roles')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    RoleController.getAllRoles,
  )
  .post(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    validator(RoleValidator.createRoleSchema),
    RoleController.createRole,
  );

router
  .route('/admin/roles/:id')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    RoleController.getRoleById,
  )
  .put(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    validator(RoleValidator.updateRoleSchema),
    RoleController.updateRole,
  )
  .delete(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    RoleController.deleteRole,
  );

export default router;




