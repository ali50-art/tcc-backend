import { Request, Response, RequestHandler } from 'express';
import MessageService from '../../services/v1/message.service';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';
import { multerConfig } from '../../utils/multer';
import multer from 'multer';
import ConversationRepository from '../../database/mongodb/repositories/conversation.repository';
import { getIO } from '../../realtime/socket';

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

// @desc    Send image message (upload to S3)
// @route   POST /api/messages/:conversationId/image
// @access  Private
const sendImage = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const file: any = (req as any).file;
  if (!file?.location) {
    res.status(HttpCode.BAD_REQUEST).json({ success: false, message: 'File required', data: null });
    return;
  }

  const conversationId = new Types.ObjectId(req.params.conversationId);
  const result: any = await MessageService.sendMessageWithAttachment(
    conversationId,
    req.user.id,
    req.body?.content || '',
    {
      url: file.location,
      mimeType: file.mimetype,
      size: file.size,
    },
  );

  // Emit realtime event to all participants
  const conv: any = await ConversationRepository.getById(conversationId);
  const participants: any[] = conv?.participants || [];
  participants.forEach((p) => {
    const pid = String(p?._id || p);
    if (pid) getIO().to(`user:${pid}`).emit('message:new', { conversationId: String(conversationId), message: result });
  });

  res.status(HttpCode.CREATED).json({ success: true, message: 'Image sent', data: result });
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
  sendImage: [multer(multerConfig).single('file'), sendImage] as any,
};




