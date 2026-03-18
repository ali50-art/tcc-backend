import { Request, Response, RequestHandler } from 'express';
import ExpenseService from '../../services/v1/expense.service';
import AsyncHandler from 'express-async-handler';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE } from '../../constants/constants';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';
import PDFDocument from 'pdfkit';

// @desc    Get my expenses
// @route   GET /api/expenses
// @access  Private
const getMyExpenses: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize } = req.query;
  const result = await ExpenseService.getMyExpenses(
    req.user.id,
    Number(page || DEFAULT_CURRENT_PAGE),
    Number(pageSize || DEFAULT_PAGE_SIZE),
  );
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get expense by ID
// @route   GET /api/expenses/:id
// @access  Private
const getExpenseById: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await ExpenseService.getExpenseById(new Types.ObjectId(req.params.id));
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await ExpenseService.createExpense(req.user.id, req.body);
  res.status(HttpCode.CREATED).json({ success: true, message: 'Expense created', data: result });
});

// @desc    Get expense summary
// @route   GET /api/expenses/summary
// @access  Private
const getExpenseSummary: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await ExpenseService.getExpenseSummary(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get pending expenses (manager)
// @route   GET /api/manager/expenses/pending
// @access  Private/Manager
const getPendingExpenses: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await ExpenseService.getPendingExpenses(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Approve expense (manager)
// @route   PUT /api/manager/expenses/:id/approve
// @access  Private/Manager
const approveExpense: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await ExpenseService.approveExpense(new Types.ObjectId(req.params.id), req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: 'Expense approved', data: result });
});

// @desc    Reject expense (manager)
// @route   PUT /api/manager/expenses/:id/reject
// @access  Private/Manager
const rejectExpense: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  const result = await ExpenseService.rejectExpense(new Types.ObjectId(req.params.id), req.user.id, reason);
  res.status(HttpCode.OK).json({ success: true, message: 'Expense rejected', data: result });
});

// @desc    Download expense as PDF
// @route   GET /api/expenses/:id/pdf
// @access  Private (owner/manager/admin)
const downloadExpensePdf: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const expense: any = await ExpenseService.getExpenseForDownload(new Types.ObjectId(req.params.id), req.user);

  const expenseId = String(expense?._id || req.params.id);
  const fileName = `expense_${expenseId}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  doc.pipe(res);

  const title = 'Note de frais';
  doc.fontSize(20).text(title, { align: 'left' });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor('#666').text(`Référence: ${expenseId}`);
  doc.fillColor('#000');
  doc.moveDown();

  const employeeName = expense?.user?.name || '';
  const employeeEmail = expense?.user?.email || '';
  doc.fontSize(12).text(`Employé: ${employeeName}`);
  if (employeeEmail) doc.fontSize(10).fillColor('#666').text(employeeEmail);
  doc.fillColor('#000');
  doc.moveDown();

  const fmtDate = (d: any) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');
  const amount = typeof expense?.amount === 'number' ? expense.amount : Number(expense?.amount || 0);
  const amountStr = amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

  doc.fontSize(12).text(`Type: ${expense?.type || '-'}`);
  doc.text(`Description: ${expense?.description || '-'}`);
  doc.text(`Date: ${fmtDate(expense?.date) || '-'}`);
  doc.text(`Montant: ${amountStr}`);
  doc.text(`Statut: ${expense?.status || '-'}`);
  if (expense?.rejectionReason) doc.text(`Motif de refus: ${expense.rejectionReason}`);
  if (expense?.approvedBy?.name) doc.text(`Validé par: ${expense.approvedBy.name}`);
  doc.moveDown();

  doc
    .fontSize(10)
    .fillColor('#666')
    .text('Ce document est généré automatiquement par TCC CenterDesk.', { align: 'left' });

  doc.end();
});

export default {
  getMyExpenses,
  getExpenseById,
  createExpense,
  getExpenseSummary,
  getPendingExpenses,
  approveExpense,
  rejectExpense,
  downloadExpensePdf,
};




