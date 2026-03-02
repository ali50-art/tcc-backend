import { Types } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';
import IAuditLog, { AuditLog } from '../models/auditLog.model';

const getAll = async (condition: object, paging: pagingObj) => {
  const options = {
    query: AuditLog.find(condition).populate('user', 'name email').sort({ createdAt: -1 }),
    limit: paging.limit ? paging.limit : null,
    page: paging.page ? paging.page : null,
  };

  const res = (await AuditLog.paginate(options)) as PaginationModel<IAuditLog>;
  return res;
};

const create = async (item: object) => await AuditLog.create(item);

export default {
  getAll,
  create,
};




