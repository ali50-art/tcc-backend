import { Request, Response, RequestHandler } from 'express';
import DocumentService from '../../services/v1/document.service';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';
import path from 'path';

// @desc    Get my documents
// @route   GET /api/documents
// @access  Private
const getMyDocuments: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category } = req.query;
  const result = await DocumentService.getMyDocuments(req.user.id, category as string);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await DocumentService.getDocumentById(new Types.ObjectId(req.params.id));
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Download document
// @route   GET /api/documents/:id/download
// @access  Private
const downloadDocument: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const doc = await DocumentService.getDocumentById(new Types.ObjectId(req.params.id));
  const filePath = path.join(__dirname, '..', '..', '..', 'public', 'documents', doc.file);
  res.download(filePath, doc.name);
});

// @desc    Upload document
// @route   POST /api/documents
// @access  Private
const uploadDocument: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const data = {
    name: req.body.name || req.file?.originalname,
    category: req.body.category,
    file: req.file?.filename,
    size: req.file?.size || 0,
    mimeType: req.file?.mimetype || '',
  };
  const result = await DocumentService.uploadDocument(req.user.id, data);
  res.status(HttpCode.CREATED).json({ success: true, message: 'Document uploaded', data: result });
});

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await DocumentService.deleteDocument(new Types.ObjectId(req.params.id), req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: 'Document deleted', data: result });
});

export default {
  getMyDocuments,
  getDocumentById,
  downloadDocument,
  uploadDocument,
  deleteDocument,
};




