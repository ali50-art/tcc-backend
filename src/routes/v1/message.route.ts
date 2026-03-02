import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import MessageController from '../../controllers/v1/message.controller';

router.get('/messages/conversations', Authorization.Authenticated, MessageController.getConversations);
router.post('/messages/conversations', Authorization.Authenticated, MessageController.createConversation);
router.get('/messages/:conversationId', Authorization.Authenticated, MessageController.getMessages);
router.post('/messages/:conversationId', Authorization.Authenticated, MessageController.sendMessage);

export default router;




