import DocumentRepository from '../../database/mongodb/repositories/document.repository';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

const getMyDocuments = async (userId: Types.ObjectId, category?: string) => {
  const query: any = { user: userId };
  if (category) query.category = category;
  const docs = await DocumentRepository.getByQuery(query);
  return docs;
};

const getDocumentById = async (id: Types.ObjectId) => {
  const doc = await DocumentRepository.getById(id);
  if (!doc) throw new ErrorHandler('Document not found', HttpCode.NOT_FOUND);
  return doc;
};

const uploadDocument = async (userId: Types.ObjectId, data: any) => {
  const doc = await DocumentRepository.create({
    ...data,
    user: userId,
    uploadedBy: userId,
  });
  return doc;
};

const deleteDocument = async (id: Types.ObjectId, userId: Types.ObjectId) => {
  const doc = await DocumentRepository.getById(id);
  if (!doc) throw new ErrorHandler('Document not found', HttpCode.NOT_FOUND);
  await DocumentRepository.remove(id);
  return doc;
};

export default {
  getMyDocuments,
  getDocumentById,
  uploadDocument,
  deleteDocument,
};




