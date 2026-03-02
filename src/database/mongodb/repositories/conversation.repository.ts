import { Types } from 'mongoose';
import { Conversation } from '../models/conversation.model';

const getAll = async (userId: Types.ObjectId) =>
  await Conversation.find({ participants: userId })
    .populate('participants', 'name email avatar')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

const getById = async (id: Types.ObjectId) =>
  await Conversation.findById(id).populate('participants', 'name email avatar');

const create = async (item: object) => await Conversation.create(item);

const edit = async (id: Types.ObjectId, item: object) =>
  await Conversation.findByIdAndUpdate(id, item, { new: true });

const findByParticipants = async (participants: Types.ObjectId[]) =>
  await Conversation.findOne({
    participants: { $all: participants },
    isGroup: false,
  });

export default {
  getAll,
  getById,
  create,
  edit,
  findByParticipants,
};




