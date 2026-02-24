import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import { multerConfig } from '../../utils/multer';
import multer from 'multer';

import DocumentController from '../../controllers/v1/document.controller';

router.get('/documents', Authorization.Authenticated, DocumentController.getMyDocuments);
router.get('/documents/:id', Authorization.Authenticated, DocumentController.getDocumentById);
router.get('/documents/:id/download', Authorization.Authenticated, DocumentController.downloadDocument);
router.post(
  '/documents',
  Authorization.Authenticated,
  multer(multerConfig).single('file'),
  DocumentController.uploadDocument,
);
router.delete('/documents/:id', Authorization.Authenticated, DocumentController.deleteDocument);

export default router;




