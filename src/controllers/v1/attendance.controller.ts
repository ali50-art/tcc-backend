import { Request, Response } from 'express';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';
import DocumentRepository from '../../database/mongodb/repositories/document.repository';
import { DocumentCategoryEnum } from '../../constants/constants';
import { Types } from 'mongoose';

// @desc    Upload attendance Excel from cron script (S3 already handled by multerS3)
// @route   POST /api/admin/attendance-upload
// @access  Protected via x-cron-secret header (no user login)
export const uploadAttendance = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const secretHeader = (req.headers['x-cron-secret'] as string) || '';
  if (!process.env.ATT_UPLOAD_SECRET || secretHeader !== process.env.ATT_UPLOAD_SECRET) {
    res
      .status(HttpCode.UNAUTHORIZED)
      .json({ success: false, message: 'Unauthorized cron request', data: null });
    return;
  }

  const file: any = (req as any).file;
  if (!file?.location) {
    res.status(HttpCode.BAD_REQUEST).json({ success: false, message: 'File required', data: null });
    return;
  }

  // Optionally associate to a user; for now store as system document (no specific user)
  const systemUserId = (req.body?.userId && Types.ObjectId.isValid(req.body.userId))
    ? new Types.ObjectId(req.body.userId)
    : undefined;

  const doc = await DocumentRepository.create({
    user: systemUserId,
    name: file.originalname || 'pointage.xlsx',
    category: DocumentCategoryEnum.autre,
    file: file.location,
    size: file.size,
    mimeType: file.mimetype,
    uploadedBy: systemUserId,
  });

  res.status(HttpCode.CREATED).json({
    success: true,
    message: 'Attendance file uploaded',
    data: doc,
  });
});

export default {
  uploadAttendance,
};

