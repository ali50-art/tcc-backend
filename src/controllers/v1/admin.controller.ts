import { Request, Response, RequestHandler } from 'express';
import AdminService from '../../services/v1/admin.service';
import AsyncHandler from 'express-async-handler';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE } from '../../constants/constants';
import { HttpCode } from '../../utils/httpCode';

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await AdminService.getDashboardStats();
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page, pageSize } = req.query;
  const result = await AdminService.getAuditLogs(
    Number(page || DEFAULT_CURRENT_PAGE),
    Number(pageSize || DEFAULT_PAGE_SIZE),
  );
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

export default {
  getDashboardStats,
  getAuditLogs,
};




