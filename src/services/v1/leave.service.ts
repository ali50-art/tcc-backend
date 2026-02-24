import LeaveRepository from '../../database/mongodb/repositories/leave.repository';
import UserRepository from '../../database/mongodb/repositories/user.repository';
import NotificationRepository from '../../database/mongodb/repositories/notification.repository';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { LeaveStatusEnum } from '../../constants/constants';
import { Types } from 'mongoose';

const getMyLeaves = async (userId: Types.ObjectId, page: number, pageSize: number) => {
  const options = { page, limit: pageSize };
  const { docs, ...meta } = await LeaveRepository.getAll({ user: userId }, options, {});
  return { docs, meta };
};

const getLeaveById = async (id: Types.ObjectId) => {
  const leave = await LeaveRepository.getById(id);
  if (!leave) throw new ErrorHandler('Leave not found', HttpCode.NOT_FOUND);
  return leave;
};

const createLeave = async (userId: Types.ObjectId, data: any) => {
  const leave = await LeaveRepository.create({ ...data, user: userId, status: LeaveStatusEnum.pending });
  // Create notification for manager
  const user = await UserRepository.getById(userId);
  if (user?.manager) {
    await NotificationRepository.create({
      user: user.manager,
      title: 'Nouvelle demande de congé',
      body: `${user.name} a soumis une demande de congé`,
      type: 'leave',
      data: { leaveId: leave._id },
    });
  }
  return leave;
};

const getLeaveBalance = async (userId: Types.ObjectId) => {
  const currentYear = new Date().getFullYear();
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);

  const approvedLeaves = await LeaveRepository.getByQuery({
    user: userId,
    status: LeaveStatusEnum.approved,
    startDate: { $gte: startOfYear, $lte: endOfYear },
  });

  let cpUsed = 0;
  let rttUsed = 0;
  approvedLeaves.forEach((leave: any) => {
    const days = Math.ceil(
      (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (leave.type === 'cp') cpUsed += days;
    if (leave.type === 'rtt') rttUsed += days;
  });

  return {
    cp: { total: 25, used: cpUsed, remaining: 25 - cpUsed },
    rtt: { total: 10, used: rttUsed, remaining: 10 - rttUsed },
  };
};

// Manager functions
const getPendingLeaves = async (managerId: Types.ObjectId) => {
  const teamMembers = await UserRepository.getByQuery({ manager: managerId });
  const teamIds = teamMembers.map((m: any) => m._id);
  const leaves = await LeaveRepository.getByQuery({ user: { $in: teamIds }, status: LeaveStatusEnum.pending });
  return leaves;
};

const approveLeave = async (id: Types.ObjectId, managerId: Types.ObjectId) => {
  const leave = await LeaveRepository.getById(id);
  if (!leave) throw new ErrorHandler('Leave not found', HttpCode.NOT_FOUND);
  if (leave.status !== LeaveStatusEnum.pending) throw new ErrorHandler('Leave already processed', HttpCode.BAD_REQUEST);

  const updated = await LeaveRepository.edit(id, {
    status: LeaveStatusEnum.approved,
    approvedBy: managerId,
  });

  await NotificationRepository.create({
    user: (leave as any).user._id || leave.user,
    title: 'Congé approuvé',
    body: 'Votre demande de congé a été approuvée',
    type: 'leave',
    data: { leaveId: id },
  });

  return updated;
};

const rejectLeave = async (id: Types.ObjectId, managerId: Types.ObjectId, reason: string) => {
  const leave = await LeaveRepository.getById(id);
  if (!leave) throw new ErrorHandler('Leave not found', HttpCode.NOT_FOUND);
  if (leave.status !== LeaveStatusEnum.pending) throw new ErrorHandler('Leave already processed', HttpCode.BAD_REQUEST);

  const updated = await LeaveRepository.edit(id, {
    status: LeaveStatusEnum.rejected,
    approvedBy: managerId,
    rejectionReason: reason,
  });

  await NotificationRepository.create({
    user: (leave as any).user._id || leave.user,
    title: 'Congé refusé',
    body: `Votre demande de congé a été refusée: ${reason}`,
    type: 'leave',
    data: { leaveId: id },
  });

  return updated;
};

export default {
  getMyLeaves,
  getLeaveById,
  createLeave,
  getLeaveBalance,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
};




