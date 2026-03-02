import { Types } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../utils/apiFeatures';
import IExpense, { Expense } from '../models/expense.model';

const getAll = async (condition: object, paging: pagingObj, query: object) => {
  let findAllQuery = Expense.find({ ...condition }).populate('user', 'name email avatar').populate('approvedBy', 'name');

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .limitFields()
    .search(['description']);

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };

  const res = (await Expense.paginate(options)) as PaginationModel<IExpense>;
  return res;
};

const getById = async (id: Types.ObjectId) =>
  await Expense.findById(id).populate('user', 'name email avatar').populate('approvedBy', 'name');

const getByQuery = async (options: object) =>
  await Expense.find(options).populate('user', 'name email avatar');

const getOneByQuery = async (options: object) =>
  await Expense.findOne(options);

const create = async (item: object) => await Expense.create(item);

const edit = async (id: Types.ObjectId, item: object) =>
  await Expense.findByIdAndUpdate(id, item, { new: true });

const remove = async (id: Types.ObjectId) => await Expense.findByIdAndDelete(id);

const aggregate = async (pipeline: any[]) => await Expense.aggregate(pipeline);

export default {
  getAll,
  getById,
  getByQuery,
  getOneByQuery,
  create,
  edit,
  remove,
  aggregate,
};




