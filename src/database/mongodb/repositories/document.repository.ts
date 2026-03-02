import { Types } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';
import APIFeatures from '../../../utils/apiFeatures';
import IDocument, { Doc } from '../models/document.model';

const getAll = async (condition: object, paging: pagingObj, query: object) => {
  let findAllQuery = Doc.find({ ...condition }).populate('user', 'name email').populate('uploadedBy', 'name');

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

  const res = (await Doc.paginate(options)) as PaginationModel<IDocument>;
  return res;
};

const getById = async (id: Types.ObjectId) =>
  await Doc.findById(id).populate('user', 'name email').populate('uploadedBy', 'name');

const getByQuery = async (options: object) =>
  await Doc.find(options).populate('user', 'name email');

const create = async (item: object) => await Doc.create(item);

const edit = async (id: Types.ObjectId, item: object) =>
  await Doc.findByIdAndUpdate(id, item, { new: true });

const remove = async (id: Types.ObjectId) => await Doc.findByIdAndDelete(id);

export default {
  getAll,
  getById,
  getByQuery,
  create,
  edit,
  remove,
};




