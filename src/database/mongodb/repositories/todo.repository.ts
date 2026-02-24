import { Types } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../utils/apiFeatures';
import ITodo, { Todo } from '../models/todo.model';

const getAll = async (condition: object, paging: pagingObj, query: object) => {
  let findAllQuery = Todo.find({ ...condition });

  const features = new APIFeatures(findAllQuery, query)
    .filter()
    .sort()
    .limitFields()
    .search(['name']);

  const options = {
    query: features.query,
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };

  const res = (await Todo.paginate(options)) as PaginationModel<ITodo>;
  return res;
};

const getById = async (id: Types.ObjectId, select: string = '', populate: string = '') =>
  await Todo.findById(id).select(select).populate(populate);

const getByQuery = async (options: object, select: string = '', populate: string = '') =>
  await Todo.find(options).select(select).populate(populate);

const getOneByQuery = async (options: object, select: string = '', populate: string = '') =>
  await Todo.findOne(options).select(select).populate(populate);

const create = async (item: object) => await Todo.create(item);

const edit = async (id: Types.ObjectId, item: object) =>
  await Todo.findByIdAndUpdate(id, item, { new: true });

const remove = async (id: Types.ObjectId) => await Todo.findByIdAndDelete(id);

export default {
  getAll,
  getById,
  getByQuery,
  getOneByQuery,
  create,
  edit,
  remove,
};
