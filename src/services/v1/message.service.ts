import ConversationRepository from '../../database/mongodb/repositories/conversation.repository';
import MessageRepository from '../../database/mongodb/repositories/message.repository';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

const getConversations = async (userId: Types.ObjectId) => {
  const conversations = await ConversationRepository.getAll(userId);
  return conversations;
};

const getMessages = async (conversationId: Types.ObjectId, userId: Types.ObjectId) => {
  const conversation = await ConversationRepository.getById(conversationId);
  if (!conversation) throw new ErrorHandler('Conversation not found', HttpCode.NOT_FOUND);

  // Mark messages as read
  await MessageRepository.markAsRead(conversationId, userId);

  const messages = await MessageRepository.getAll(conversationId);
  return messages;
};

const sendMessage = async (conversationId: Types.ObjectId, senderId: Types.ObjectId, content: string) => {
  const conversation = await ConversationRepository.getById(conversationId);
  if (!conversation) throw new ErrorHandler('Conversation not found', HttpCode.NOT_FOUND);

  const message = await MessageRepository.create({
    conversation: conversationId,
    sender: senderId,
    content,
    readBy: [senderId],
  });

  // Update last message in conversation
  await ConversationRepository.edit(conversationId, { lastMessage: message._id });

  return message;
};

const createConversation = async (userId: Types.ObjectId, participantId: Types.ObjectId, isGroup: boolean, name?: string) => {
  // Check if 1:1 conversation exists
  if (!isGroup) {
    const existing = await ConversationRepository.findByParticipants([userId, participantId]);
    if (existing) return existing;
  }

  const conversation = await ConversationRepository.create({
    participants: isGroup ? [userId, participantId] : [userId, participantId],
    isGroup,
    name: name || '',
  });

  return conversation;
};

export default {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
};




