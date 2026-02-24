import express from 'express';
import userRoutes from './v1/user.route';
import todoRoutes from './v1/todo.route';
import leaveRoutes from './v1/leave.route';
import expenseRoutes from './v1/expense.route';
import documentRoutes from './v1/document.route';
import notificationRoutes from './v1/notification.route';
import messageRoutes from './v1/message.route';
import adminRoutes from './v1/admin.route';

const router = express.Router();

router.use('/', userRoutes, todoRoutes, leaveRoutes, expenseRoutes, documentRoutes, notificationRoutes, messageRoutes, adminRoutes);

export default router;
