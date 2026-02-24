import express from 'express';

const router = express.Router();

import Authorization from '../../middlewares/auth';
import NotificationController from '../../controllers/v1/notification.controller';

router.get('/notifications', Authorization.Authenticated, NotificationController.getMyNotifications);
router.get('/notifications/unread-count', Authorization.Authenticated, NotificationController.getUnreadCount);
router.put('/notifications/read-all', Authorization.Authenticated, NotificationController.markAllAsRead);
router.put('/notifications/:id/read', Authorization.Authenticated, NotificationController.markAsRead);

export default router;




