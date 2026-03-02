import NotificationRepository from '../../database/mongodb/repositories/notification.repository';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

const getMyNotifications = async (userId: Types.ObjectId) => {
  const notifications = await NotificationRepository.getAll({ user: userId });
  return notifications;
};

const markAsRead = async (id: Types.ObjectId) => {
  const notification = await NotificationRepository.getById(id);
  if (!notification) throw new ErrorHandler('Notification not found', HttpCode.NOT_FOUND);
  const updated = await NotificationRepository.edit(id, { isRead: true });
  return updated;
};

const markAllAsRead = async (userId: Types.ObjectId) => {
  await NotificationRepository.markAllAsRead(userId);
  return { message: 'All notifications marked as read' };
};

const getUnreadCount = async (userId: Types.ObjectId) => {
  const count = await NotificationRepository.countUnread(userId);
  return { count };
};

export default {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};




