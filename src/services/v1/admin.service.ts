import UserRepository from '../../database/mongodb/repositories/user.repository';
import LeaveRepository from '../../database/mongodb/repositories/leave.repository';
import ExpenseRepository from '../../database/mongodb/repositories/expense.repository';
import RoleRepository from '../../database/mongodb/repositories/role.repository';
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

  return {
    totalUsers,
    activeUsers,
    totalRoles,
    pendingLeaves,
    pendingExpenses,
    securityAlerts: 3,
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




