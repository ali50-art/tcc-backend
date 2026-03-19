import UserRepository from '../../database/mongodb/repositories/user.repository';
import LeaveRepository from '../../database/mongodb/repositories/leave.repository';
import ExpenseRepository from '../../database/mongodb/repositories/expense.repository';
import RoleRepository from '../../database/mongodb/repositories/role.repository';
import { Todo } from '../../database/mongodb/models/todo.model';
import AuditLogRepository from '../../database/mongodb/repositories/auditLog.repository';
import { User } from '../../database/mongodb/models/user.model';
import { Leave } from '../../database/mongodb/models/leave.model';
import { Expense } from '../../database/mongodb/models/expense.model';
import { Types } from 'mongoose';

const getDashboardStats = async () => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ role: { $ne: 'inactive' } });
  const totalRoles = (await RoleRepository.getAll()).length;
  const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
  const pendingExpenses = await Expense.countDocuments({ status: 'pending' });

  // Today range
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

  // Employees absent today (approved leaves overlapping today)
  const absentsToday = await Leave.countDocuments({
    status: 'approved',
    startDate: { $lte: dayEnd },
    endDate: { $gte: dayStart },
  });

  // Task stats (simple aggregation)
  const totalTasks = await Todo.countDocuments();
  const tasksCompleted = await Todo.countDocuments({ isConpleted: true });
  const tasksInProgress = await Todo.countDocuments({ isConpleted: { $ne: true } });

  // Simple "best worker": user with most completed tasks (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const top = await Todo.aggregate([
    {
      $match: {
        isConpleted: true,
        updatedAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: '$user',
        completed: { $sum: 1 },
      },
    },
    { $sort: { completed: -1 } },
    { $limit: 1 },
  ]);

  let bestWorker: { id: string; name: string; completedTasks: number } | null = null;
  if (top.length > 0 && top[0]._id) {
    const u = await User.findById(top[0]._id).select('name');
    if (u) {
      bestWorker = {
        id: String(u._id),
        name: u.name,
        completedTasks: top[0].completed,
      };
    }
  }

  return {
    totalUsers,
    activeUsers,
    totalRoles,
    pendingLeaves,
    pendingExpenses,
    securityAlerts: 3,
    absentsToday,
    totalTasks,
    tasksCompleted,
    tasksInProgress,
    bestWorker,
  };
};

const getAuditLogs = async (page: number, pageSize: number) => {
  const options = { page, limit: pageSize };
  const { docs, ...meta } = await AuditLogRepository.getAll({}, options);
  return { docs, meta };
};

const createAuditLog = async (userId: Types.ObjectId, action: string, entity: string, details: string, ipAddress?: string) => {
  const log = await AuditLogRepository.create({
    user: userId,
    action,
    entity,
    details,
    ipAddress,
  });
  return log;
};

export default {
  getDashboardStats,
  getAuditLogs,
  createAuditLog,
};




