import { Request, Response, RequestHandler } from 'express';
import NotificationService from '../../services/v1/notification.service';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
const getMyNotifications: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await NotificationService.getMyNotifications(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await NotificationService.markAsRead(new Types.ObjectId(req.params.id));
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await NotificationService.markAllAsRead(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await NotificationService.getUnreadCount(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

export default {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};




