import { Types } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../utils/apiFeatures';
import ILeave, { Leave } from '../models/leave.model';

const getAll = async (condition: object, paging: pagingObj, query: object) => {
  let findAllQuery = Leave.find({ ...condition }).populate('user', 'name email avatar').populate('approvedBy', 'name');

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .limitFields()
    .search(['reason']);

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };

  const res = (await Leave.paginate(options)) as PaginationModel<ILeave>;
  return res;
};

const getById = async (id: Types.ObjectId, select: string = '', populate: string = '') =>
  await Leave.findById(id).select(select).populate('user', 'name email avatar').populate('approvedBy', 'name');

const getByQuery = async (options: object, select: string = '', populate: string = '') =>
  await Leave.find(options).select(select).populate('user', 'name email avatar');

const getOneByQuery = async (options: object, select: string = '', populate: string = '') =>
  await Leave.findOne(options).select(select).populate(populate);

const create = async (item: object) => await Leave.create(item);

const edit = async (id: Types.ObjectId, item: object) =>
  await Leave.findByIdAndUpdate(id, item, { new: true });

const remove = async (id: Types.ObjectId) => await Leave.findByIdAndDelete(id);

const countByQuery = async (query: object) => await Leave.countDocuments(query);

export default {
  getAll,
  getById,
  getByQuery,
  getOneByQuery,
  create,
  edit,
  remove,
  countByQuery,
};




