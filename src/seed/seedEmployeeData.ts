import 'dotenv/config';
import mongoose, { Types } from 'mongoose';
import connection from '../database/mongodb/config';
import UserRepository from '../database/mongodb/repositories/user.repository';
import { RolesEnum, ExpenseStatusEnum, ExpenseTypeEnum, LeaveStatusEnum, LeaveTypeEnum, DocumentCategoryEnum } from '../constants/constants';
import { Expense } from '../database/mongodb/models/expense.model';
import { Leave } from '../database/mongodb/models/leave.model';
import { Doc } from '../database/mongodb/models/document.model';
import { Notification } from '../database/mongodb/models/notification.model';

const EMPLOYEE_ID = new Types.ObjectId('699d7dc6d1af32919a8c29fc');

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

async function main() {
  await connection();

  const user = await UserRepository.getById(EMPLOYEE_ID);
  if (!user) {
    throw new Error(`User not found: ${EMPLOYEE_ID.toHexString()}`);
  }

  await UserRepository.edit(EMPLOYEE_ID, {
    role: RolesEnum.employee,
    department: user.department || 'IT',
    currentJob: user.currentJob || 'Employé',
    city: user.city || 'Paris',
    isActive: true,
  });

  // Make seeding idempotent
  await Promise.all([
    Expense.deleteMany({ user: EMPLOYEE_ID }),
    Leave.deleteMany({ user: EMPLOYEE_ID }),
    Doc.deleteMany({ user: EMPLOYEE_ID }),
    Notification.deleteMany({ user: EMPLOYEE_ID }),
  ]);

  const expenses = await Expense.insertMany([
    {
      user: EMPLOYEE_ID,
      type: ExpenseTypeEnum.transport,
      description: 'Taxi Aéroport',
      amount: 45.0,
      date: daysAgo(3),
      status: ExpenseStatusEnum.pending,
    },
    {
      user: EMPLOYEE_ID,
      type: ExpenseTypeEnum.repas,
      description: 'Déjeuner client',
      amount: 32.5,
      date: daysAgo(7),
      status: ExpenseStatusEnum.approved,
    },
    {
      user: EMPLOYEE_ID,
      type: ExpenseTypeEnum.hebergement,
      description: 'Hôtel (mission)',
      amount: 120.0,
      date: daysAgo(12),
      status: ExpenseStatusEnum.reimbursed,
    },
    {
      user: EMPLOYEE_ID,
      type: ExpenseTypeEnum.materiel,
      description: 'Fournitures bureau',
      amount: 18.9,
      date: daysAgo(18),
      status: ExpenseStatusEnum.rejected,
      rejectionReason: 'Justificatif manquant',
    },
  ]);

  const leaves = await Leave.insertMany([
    {
      user: EMPLOYEE_ID,
      type: LeaveTypeEnum.cp,
      startDate: daysAgo(20),
      endDate: daysAgo(18),
      reason: 'Congé planifié',
      status: LeaveStatusEnum.approved,
    },
    {
      user: EMPLOYEE_ID,
      type: LeaveTypeEnum.rtt,
      startDate: daysAgo(6),
      endDate: daysAgo(6),
      reason: 'RTT',
      status: LeaveStatusEnum.pending,
    },
  ]);

  await Doc.insertMany([
    {
      user: EMPLOYEE_ID,
      name: 'Contrat de travail.pdf',
      category: DocumentCategoryEnum.contrats,
      file: 'https://example.com/contrat.pdf',
      size: 1024 * 1024,
      mimeType: 'application/pdf',
      uploadedBy: EMPLOYEE_ID,
    },
    {
      user: EMPLOYEE_ID,
      name: 'Fiche de paie - mois courant.pdf',
      category: DocumentCategoryEnum.fiches_paie,
      file: 'https://example.com/payslip.pdf',
      size: 950 * 1024,
      mimeType: 'application/pdf',
      uploadedBy: EMPLOYEE_ID,
    },
  ]);

  await Notification.insertMany([
    {
      user: EMPLOYEE_ID,
      title: 'Seed: Note de frais créée',
      body: `Une note de frais (${expenses[0]._id}) a été créée (pending).`,
      type: 'expense',
      data: { expenseId: expenses[0]._id },
      isRead: false,
    },
    {
      user: EMPLOYEE_ID,
      title: 'Seed: Congé en attente',
      body: `Votre demande RTT (${leaves[1]._id}) est en attente.`,
      type: 'leave',
      data: { leaveId: leaves[1]._id },
      isRead: false,
    },
    {
      user: EMPLOYEE_ID,
      title: 'Seed: Documents disponibles',
      body: 'Vos documents RH ont été ajoutés.',
      type: 'document',
      isRead: true,
    },
  ]);

  // eslint-disable-next-line no-console
  console.log('Seed completed for employee:', EMPLOYEE_ID.toHexString());
} 

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });

