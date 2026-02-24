import { Request, Response, RequestHandler } from 'express';
import LeaveService from '../../services/v1/leave.service';
import AsyncHandler from 'express-async-handler';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE } from '../../constants/constants';
import { HttpCode } from '../../utils/httpCode';
import { Types } from 'mongoose';

// @desc    Get my leaves
// @route   GET /api/leaves
// @access  Private
const getMyLeaves: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize } = req.query;
  const result = await LeaveService.getMyLeaves(
    req.user.id,
    Number(page || DEFAULT_CURRENT_PAGE),
    Number(pageSize || DEFAULT_PAGE_SIZE),
  );
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get leave by ID
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveById: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await LeaveService.getLeaveById(new Types.ObjectId(req.params.id));
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
const createLeave: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await LeaveService.createLeave(req.user.id, req.body);
  res.status(HttpCode.CREATED).json({ success: true, message: 'Leave request created', data: result });
});

// @desc    Get leave balance
// @route   GET /api/leaves/balance
// @access  Private
const getLeaveBalance: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await LeaveService.getLeaveBalance(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get pending leaves (manager)
// @route   GET /api/manager/leaves/pending
// @access  Private/Manager
const getPendingLeaves: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await LeaveService.getPendingLeaves(req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Approve leave (manager)
// @route   PUT /api/manager/leaves/:id/approve
// @access  Private/Manager
const approveLeave: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await LeaveService.approveLeave(new Types.ObjectId(req.params.id), req.user.id);
  res.status(HttpCode.OK).json({ success: true, message: 'Leave approved', data: result });
});

// @desc    Reject leave (manager)
// @route   PUT /api/manager/leaves/:id/reject
// @access  Private/Manager
const rejectLeave: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { reason } = req.body;
  const result = await LeaveService.rejectLeave(new Types.ObjectId(req.params.id), req.user.id, reason);
  res.status(HttpCode.OK).json({ success: true, message: 'Leave rejected', data: result });
});

export default {
  getMyLeaves,
  getLeaveById,
  createLeave,
  getLeaveBalance,
  getPendingLeaves,
  approveLeave,
  rejectLeave,
};




