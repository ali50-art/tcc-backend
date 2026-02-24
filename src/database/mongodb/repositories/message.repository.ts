import { Types } from 'mongoose';
import { PaginationModel } from 'mongoose-paginate-ts';
import IMessage, { Message } from '../models/message.model';

const getAll = async (conversationId: Types.ObjectId, page: number = 1, limit: number = 50) =>
  await Message.find({ conversation: conversationId })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

const create = async (item: object) => await Message.create(item);

const markAsRead = async (conversationId: Types.ObjectId, userId: Types.ObjectId) =>
  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, isRead: false },
    { isRead: true, $addToSet: { readBy: userId } },
  );

export default {
  getAll,
  create,
  markAsRead,
};




