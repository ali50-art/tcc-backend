import { Request, Response, RequestHandler } from 'express';
import RoleService from '../../services/v1/role.service';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

// @desc    Get all roles
// @route   GET /api/admin/roles
// @access  Private/Admin
const getAllRoles: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await RoleService.getAllRoles();
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get role by ID
// @route   GET /api/admin/roles/:id
// @access  Private/Admin
const getRoleById: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await RoleService.getRoleById(new Types.ObjectId(req.params.id));
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Create role
// @route   POST /api/admin/roles
// @access  Private/Admin
const createRole: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await RoleService.createRole(req.body);
  res.status(HttpCode.CREATED).json({ success: true, message: 'Role created', data: result });
});

// @desc    Update role
// @route   PUT /api/admin/roles/:id
// @access  Private/Admin
const updateRole: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await RoleService.updateRole(new Types.ObjectId(req.params.id), req.body);
  res.status(HttpCode.OK).json({ success: true, message: 'Role updated', data: result });
});

// @desc    Delete role
// @route   DELETE /api/admin/roles/:id
// @access  Private/Admin
const deleteRole: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await RoleService.deleteRole(new Types.ObjectId(req.params.id));
  res.status(HttpCode.OK).json({ success: true, message: 'Role deleted', data: result });
});

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};




