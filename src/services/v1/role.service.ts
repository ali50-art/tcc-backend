import RoleRepository from '../../database/mongodb/repositories/role.repository';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

const getAllRoles = async () => {
  const roles = await RoleRepository.getAll();
  return roles;
};

const getRoleById = async (id: Types.ObjectId) => {
  const role = await RoleRepository.getById(id);
  if (!role) throw new ErrorHandler('Role not found', HttpCode.NOT_FOUND);
  return role;
};

const createRole = async (data: any) => {
  const existing = await RoleRepository.getByName(data.name);
  if (existing) throw new ErrorHandler('Role with this name already exists', HttpCode.FORBIDDEN);
  const role = await RoleRepository.create(data);
  return role;
};

const updateRole = async (id: Types.ObjectId, data: any) => {
  const role = await RoleRepository.getById(id);
  if (!role) throw new ErrorHandler('Role not found', HttpCode.NOT_FOUND);
  const updated = await RoleRepository.edit(id, data);
  return updated;
};

const deleteRole = async (id: Types.ObjectId) => {
  const role = await RoleRepository.getById(id);
  if (!role) throw new ErrorHandler('Role not found', HttpCode.NOT_FOUND);
  await RoleRepository.remove(id);
  return role;
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};




