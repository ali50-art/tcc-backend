import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import JwtHelper from '../utils/jwtHelper';
import { TokenEnum } from '../constants/constants';
import UserRepository from '../database/mongodb/repositories/user.repository';
import { Types } from 'mongoose';
import ConversationRepository from '../database/mongodb/repositories/conversation.repository';
import MessageService from '../services/v1/message.service';

export type AuthedSocket = Socket & { user?: any };

let io: Server | null = null;

export const getIO = () => {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
};

const getTokenFromSocket = (socket: Socket) => {
  const raw =
    (socket.handshake.auth as any)?.token ||
    (socket.handshake.headers.authorization as string | undefined);
  if (!raw) return null;
  if (typeof raw !== 'string') return null;
  return raw.startsWith('Bearer ') ? raw.split(' ')[1] : raw;
};

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      credentials: true,
    },
  });

  io.use(async (socket: AuthedSocket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) return next(new Error('Unauthorized'));
      const decoded = JwtHelper.ExtractToken(token, TokenEnum.access);
      if (!decoded?.id) return next(new Error('Unauthorized'));

      const user = await UserRepository.getById(new Types.ObjectId(decoded.id));
      if (!user) return next(new Error('Unauthorized'));

      socket.user = user;
      return next();
    } catch (e) {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket: AuthedSocket) => {
    const userId = String(socket.user?._id || '');
    if (userId) socket.join(`user:${userId}`);

    socket.on('conversation:join', async ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return;
      socket.join(`conv:${conversationId}`);
    });

    socket.on('message:send', async (payload: { conversationId: string; content: string }) => {
      try {
        const conversationId = payload?.conversationId;
        const content = payload?.content ?? '';
        if (!conversationId) return;

        // Persist message
        const msg: any = await MessageService.sendMessage(
          new Types.ObjectId(conversationId),
          socket.user.id,
          content,
        );

        // Broadcast to all participants (closed community)
        const conv: any = await ConversationRepository.getById(new Types.ObjectId(conversationId));
        const participants: any[] = conv?.participants || [];

        participants.forEach((p) => {
          const pid = String(p?._id || p);
          if (pid) io?.to(`user:${pid}`).emit('message:new', { conversationId, message: msg });
        });
      } catch (e: any) {
        socket.emit('message:error', { message: e?.message || 'Failed to send message' });
      }
    });
  });

  return io;
};

