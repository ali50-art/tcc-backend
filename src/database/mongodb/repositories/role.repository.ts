import { Types } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';
import IRole, { Role } from '../models/role.model';

const getAll = async () => await Role.find().sort({ name: 1 });

const getById = async (id: Types.ObjectId) => await Role.findById(id);

const getByName = async (name: string) => await Role.findOne({ name });

const create = async (item: object) => await Role.create(item);

const edit = async (id: Types.ObjectId, item: object) =>
  await Role.findByIdAndUpdate(id, item, { new: true });

const remove = async (id: Types.ObjectId) => await Role.findByIdAndDelete(id);

export default {
  getAll,
  getById,
  getByName,
  create,
  edit,
  remove,
};




