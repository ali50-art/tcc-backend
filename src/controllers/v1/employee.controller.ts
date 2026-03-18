import { Request, Response, RequestHandler } from 'express';
import EmployeeService from '../../services/v1/employee.service';
import { ErrorHandler } from '../../utils/errorHandler';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';

// @desc    Get employee dashboard data
// @route   GET /api/employee/dashboard
// @access  Private/Employee
const getDashboard: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await EmployeeService.getDashboardData(req?.user?.id);
    res.status(HttpCode.OK).json({ success: true, message: '', data: result });
  },
);

// @desc    Get employee leave balance
// @route   GET /api/employee/leave-balance
// @access  Private/Employee
const getLeaveBalance: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await EmployeeService.getLeaveBalance(req?.user?.id);
    res.status(HttpCode.OK).json({ success: true, message: '', data: result });
  },
);

// @desc    Get employee tasks
// @route   GET /api/employee/tasks
// @access  Private/Employee
const getTasks: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await EmployeeService.getEmployeeTasks(req?.user?.id);
    res.status(HttpCode.OK).json({ success: true, message: '', data: result });
  },
);

// @desc    Get company news
// @route   GET /api/employee/news
// @access  Private/Employee
const getNews: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const result = await EmployeeService.getCompanyNews();
    res.status(HttpCode.OK).json({ success: true, message: '', data: result });
  },
);

export default {
  getDashboard,
  getLeaveBalance,
  getTasks,
  getNews,
};
