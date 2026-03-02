import ExpenseRepository from '../../database/mongodb/repositories/expense.repository';
import UserRepository from '../../database/mongodb/repositories/user.repository';
import NotificationRepository from '../../database/mongodb/repositories/notification.repository';
import { ErrorHandler } from '../../utils/errorHandler';
import { HttpCode } from '../../utils/httpCode';
import { ExpenseStatusEnum } from '../../constants/constants';
import { Types } from 'mongoose';

const getMyExpenses = async (userId: Types.ObjectId, page: number, pageSize: number) => {
  const options = { page, limit: pageSize };
  const { docs, ...meta } = await ExpenseRepository.getAll({ user: userId }, options, {});
  return { docs, meta };
};

const getExpenseById = async (id: Types.ObjectId) => {
  const expense = await ExpenseRepository.getById(id);
  if (!expense) throw new ErrorHandler('Expense not found', HttpCode.NOT_FOUND);
  return expense;
};

const createExpense = async (userId: Types.ObjectId, data: any) => {
  const expense = await ExpenseRepository.create({ ...data, user: userId, status: ExpenseStatusEnum.pending });
  const user = await UserRepository.getById(userId);
  if (user?.manager) {
    await NotificationRepository.create({
      user: user.manager,
      title: 'Nouvelle note de frais',
      body: `${user.name} a soumis une note de frais de ${data.amount}€`,
      type: 'expense',
      data: { expenseId: expense._id },
    });
  }
  return expense;
};

const getExpenseSummary = async (userId: Types.ObjectId) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const expenses = await ExpenseRepository.getByQuery({
    user: userId,
    date: { $gte: startOfMonth, $lte: endOfMonth },
  });

  let total = 0;
  let pending = 0;
  let approved = 0;
  let rejected = 0;

  expenses.forEach((exp: any) => {
    total += exp.amount;
    if (exp.status === ExpenseStatusEnum.pending) pending += exp.amount;
    if (exp.status === ExpenseStatusEnum.approved || exp.status === ExpenseStatusEnum.reimbursed) approved += exp.amount;
    if (exp.status === ExpenseStatusEnum.rejected) rejected += exp.amount;
  });

  return { total, pending, approved, rejected, count: expenses.length };
};

// Manager functions
const getPendingExpenses = async (managerId: Types.ObjectId) => {
  const teamMembers = await UserRepository.getByQuery({ manager: managerId });
  const teamIds = teamMembers.map((m: any) => m._id);
  const expenses = await ExpenseRepository.getByQuery({ user: { $in: teamIds }, status: ExpenseStatusEnum.pending });
  return expenses;
};

const approveExpense = async (id: Types.ObjectId, managerId: Types.ObjectId) => {
  const expense = await ExpenseRepository.getById(id);
  if (!expense) throw new ErrorHandler('Expense not found', HttpCode.NOT_FOUND);
  if (expense.status !== ExpenseStatusEnum.pending) throw new ErrorHandler('Expense already processed', HttpCode.BAD_REQUEST);

  const updated = await ExpenseRepository.edit(id, {
    status: ExpenseStatusEnum.approved,
    approvedBy: managerId,
  });

  await NotificationRepository.create({
    user: (expense as any).user._id || expense.user,
    title: 'Note de frais approuvée',
    body: `Votre note de frais de ${expense.amount}€ a été approuvée`,
    type: 'expense',
    data: { expenseId: id },
  });

  return updated;
};

const rejectExpense = async (id: Types.ObjectId, managerId: Types.ObjectId, reason: string) => {
  const expense = await ExpenseRepository.getById(id);
  if (!expense) throw new ErrorHandler('Expense not found', HttpCode.NOT_FOUND);
  if (expense.status !== ExpenseStatusEnum.pending) throw new ErrorHandler('Expense already processed', HttpCode.BAD_REQUEST);

  const updated = await ExpenseRepository.edit(id, {
    status: ExpenseStatusEnum.rejected,
    approvedBy: managerId,
    rejectionReason: reason,
  });

  await NotificationRepository.create({
    user: (expense as any).user._id || expense.user,
    title: 'Note de frais refusée',
    body: `Votre note de frais a été refusée: ${reason}`,
    type: 'expense',
    data: { expenseId: id },
  });

  return updated;
};

export default {
  getMyExpenses,
  getExpenseById,
  createExpense,
  getExpenseSummary,
  getPendingExpenses,
  approveExpense,
  rejectExpense,
};




