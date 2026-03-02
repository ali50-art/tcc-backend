import { Types } from 'mongoose';
import { Notification } from '../models/notification.model';

const getAll = async (condition: object) =>
  await Notification.find(condition).sort({ createdAt: -1 }).limit(50);

const getById = async (id: Types.ObjectId) =>
  await Notification.findById(id);

const create = async (item: object) => await Notification.create(item);

const edit = async (id: Types.ObjectId, item: object) =>
  await Notification.findByIdAndUpdate(id, item, { new: true });

const markAllAsRead = async (userId: Types.ObjectId) =>
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

const countUnread = async (userId: Types.ObjectId) =>
  await Notification.countDocuments({ user: userId, isRead: false });

const remove = async (id: Types.ObjectId) => await Notification.findByIdAndDelete(id);

export default {
  getAll,
  getById,
  create,
  edit,
  markAllAsRead,
  countUnread,
  remove,
};




