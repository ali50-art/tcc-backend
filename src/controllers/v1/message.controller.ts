import { Request, Response, RequestHandler } from 'express';
import MessageService from '../../services/v1/message.service';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

// @desc    Get conversations
// @route   GET /api/messages/conversations
// @access  Private
const getConversations: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await MessageService.getConversations(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await MessageService.getMessages(
    new Types.ObjectId(req.params.conversationId),
    req.user.id,
  );
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Send message
// @route   POST /api/messages/:conversationId
// @access  Private
const sendMessage: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { content } = req.body;
  const result = await MessageService.sendMessage(
    new Types.ObjectId(req.params.conversationId),
    req.user.id,
    content,
  );
  res.status(HttpCode.CREATED).json({ success: true, message: 'Message sent', data: result });
});

// @desc    Create conversation
// @route   POST /api/messages/conversations
// @access  Private
const createConversation: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { participantId, isGroup, name } = req.body;
  const result = await MessageService.createConversation(
    req.user.id,
    new Types.ObjectId(participantId),
    isGroup || false,
    name,
  );
  res.status(HttpCode.CREATED).json({ success: true, message: 'Conversation created', data: result });
});

export default {
  getConversations,
  getMessages,
  sendMessage,
  createConversation,
};




