import LeaveRepository from '../../database/mongodb/repositories/leave.repository';
import UserRepository from '../../database/mongodb/repositories/user.repository';
import NotificationRepository from '../../database/mongodb/repositories/notification.repository';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { LeaveStatusEnum, RolesEnum } from '../../constants/constants';
import { Types } from 'mongoose';
import { sendMail } from '../../utils/sendMail';

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
  const user = await UserRepository.getById(userId);

  // Email + notify admins (many admins)
  const admins = await UserRepository.getByQuery({ role: RolesEnum.admin });
  const adminEmails = Array.from(
    new Set(
      (admins || [])
        .map((a: any) => String(a?.email || '').trim().toLowerCase())
        .filter((e: string) => !!e),
    ),
  );
  if (adminEmails.length > 0) {
    const start = data?.startDate ? new Date(data.startDate).toLocaleString('fr-FR') : '';
    const end = data?.endDate ? new Date(data.endDate).toLocaleString('fr-FR') : '';
    const subject = `Nouvelle demande de congé (${data?.type || 'leave'})`;
    const body = `
      <div style="font-family:Arial, sans-serif; line-height:1.5">
        <h2 style="margin:0 0 12px 0">Nouvelle demande de congé</h2>
        <p>L’employé <strong>${user?.name || ''}</strong> a soumis une demande.</p>
        <ul>
          <li><strong>Type:</strong> ${data?.type || ''}</li>
          <li><strong>Du:</strong> ${start}</li>
          <li><strong>Au:</strong> ${end}</li>
          ${data?.reason ? `<li><strong>Motif:</strong> ${data.reason}</li>` : ''}
        </ul>
        <p>Connectez-vous à l’application pour traiter la demande.</p>
      </div>
    `;
    for (const email of adminEmails) {
      try {
        sendMail(email, subject, body);
      } catch {}
    }
  }

  // Create notification for manager
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
  const requester = await UserRepository.getById(managerId);
  if (requester?.role === RolesEnum.admin) {
    return await LeaveRepository.getByQuery({ status: LeaveStatusEnum.pending });
  }

  const teamMembers = await UserRepository.getByQuery({ manager: managerId });
  const teamIds = teamMembers.map((m: any) => m._id);
  const leaves = await LeaveRepository.getByQuery({ user: { $in: teamIds }, status: LeaveStatusEnum.pending });
  return leaves;
};

const approveLeave = async (id: Types.ObjectId, managerId: Types.ObjectId, message?: string) => {
  const leave = await LeaveRepository.getById(id);
  if (!leave) throw new ErrorHandler('Leave not found', HttpCode.NOT_FOUND);
  if (leave.status !== LeaveStatusEnum.pending) throw new ErrorHandler('Leave already processed', HttpCode.BAD_REQUEST);

  const updated = await LeaveRepository.edit(id, {
    status: LeaveStatusEnum.approved,
    approvedBy: managerId,
    decisionMessage: message || '',
  });

  await NotificationRepository.create({
    user: (leave as any).user._id || leave.user,
    title: 'Congé approuvé',
    body: message ? `Votre demande de congé a été approuvée: ${message}` : 'Votre demande de congé a été approuvée',
    type: 'leave',
    data: { leaveId: id },
  });

  // Email employee
  const employee = (leave as any).user;
  if (employee?.email) {
    const start = (leave as any)?.startDate ? new Date((leave as any).startDate).toLocaleString('fr-FR') : '';
    const end = (leave as any)?.endDate ? new Date((leave as any).endDate).toLocaleString('fr-FR') : '';
    const subject = 'Votre demande de congé a été approuvée';
    const body = `
      <div style="font-family:Arial, sans-serif; line-height:1.5">
        <h2 style="margin:0 0 12px 0">Demande approuvée</h2>
        <p>Bonjour <strong>${employee?.name || ''}</strong>,</p>
        <p>Votre demande de congé a été <strong>approuvée</strong>.</p>
        <ul>
          <li><strong>Type:</strong> ${(leave as any).type}</li>
          <li><strong>Du:</strong> ${start}</li>
          <li><strong>Au:</strong> ${end}</li>
          ${message ? `<li><strong>Message:</strong> ${message}</li>` : ''}
        </ul>
      </div>
    `;
    try {
      sendMail(employee.email, subject, body);
    } catch {}
  }

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
    decisionMessage: reason,
  });

  await NotificationRepository.create({
    user: (leave as any).user._id || leave.user,
    title: 'Congé refusé',
    body: `Votre demande de congé a été refusée: ${reason}`,
    type: 'leave',
    data: { leaveId: id },
  });

  // Email employee
  const employee = (leave as any).user;
  if (employee?.email) {
    const start = (leave as any)?.startDate ? new Date((leave as any).startDate).toLocaleString('fr-FR') : '';
    const end = (leave as any)?.endDate ? new Date((leave as any).endDate).toLocaleString('fr-FR') : '';
    const subject = 'Votre demande de congé a été refusée';
    const body = `
      <div style="font-family:Arial, sans-serif; line-height:1.5">
        <h2 style="margin:0 0 12px 0">Demande refusée</h2>
        <p>Bonjour <strong>${employee?.name || ''}</strong>,</p>
        <p>Votre demande de congé a été <strong>refusée</strong>.</p>
        <ul>
          <li><strong>Type:</strong> ${(leave as any).type}</li>
          <li><strong>Du:</strong> ${start}</li>
          <li><strong>Au:</strong> ${end}</li>
          <li><strong>Message:</strong> ${reason}</li>
        </ul>
      </div>
    `;
    try {
      sendMail(employee.email, subject, body);
    } catch {}
  }

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




