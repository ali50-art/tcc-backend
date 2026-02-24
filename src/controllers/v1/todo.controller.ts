import { Response, Request, RequestHandler } from 'express';
import AsyncHandler from 'express-async-handler';
import { Types } from 'mongoose';
import { DEFAULT_CURRENT_PAGE, DEFAULT_PAGE_SIZE } from '../../constants/constants';
import TodoService from '../../services/v1/todo.service';
import { HttpCode } from '../../utils/httpCode';

// @desc    Get All
// @route   GET /api/todos
// @access  Private
const getAll: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, page, pageSize } = req?.query;
  const result = await TodoService.getAll(
    req?.user?.id,
    String(name || ''),
    Number(page || DEFAULT_CURRENT_PAGE),
    Number(pageSize || DEFAULT_PAGE_SIZE),
  );
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Get By Id
// @route   GET /api/todos/:id
// @access  Private
const getById: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req?.params;
  const result = await TodoService.getById(req?.user?.id, new Types.ObjectId(id));
  res.status(HttpCode.OK).json({ success: true, message: '', data: result });
});

// @desc    Create
// @route   POST /api/todos
// @access  Private
const create: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await TodoService.create(req?.user?.id, req?.body);
  res.status(HttpCode.CREATED).json({
    success: true,
    message: 'Todo created successfully',
    data: result,
  });
});

// @desc    Update
// @route   PUT /api/todos/:id
// @access  Private
const edit: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req?.params;
  const result = await TodoService.edit(req?.user?.id, new Types.ObjectId(id), req?.body);
  res.status(HttpCode.OK).json({
    success: true,
    message: 'Todo updated successfully',
    data: result,
  });
});

// @desc    Delete
// @route   DELETE /api/todos/:id
// @access  Private
const remove: RequestHandler = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req?.params;
  const result = await TodoService.remove(req?.user?.id, new Types.ObjectId(id));
  res.status(HttpCode.OK).json({
    success: true,
    message: 'Todo deleted successfully',
    data: result,
  });
});

// @desc    Get All
// @route   GET /api/admin/todos
// @access  Private/Admin
const getAllAdmin: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { name, page, pageSize } = req?.query;
    const result = await TodoService.getAllAdmin(
      String(name || ''),
      Number(page || DEFAULT_CURRENT_PAGE),
      Number(pageSize || DEFAULT_PAGE_SIZE),
    );
    res.status(HttpCode.OK).json({ success: true, message: '', data: result });
  },
);

// @desc    Get By Id
// @route   GET /api/admin/todos/:id
// @access  Private/Admin
const getByIdAdmin: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req?.params;
    const result = await TodoService.getByIdAdmin(new Types.ObjectId(id));
    res.status(HttpCode.OK).json({ success: true, message: '', data: result });
  },
);

// @desc    Update
// @route   PUT /api/admin/todos/:id
// @access  Private/Admin
const editAdmin: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req?.params;
    const result = await TodoService.editAdmin(new Types.ObjectId(id), req?.body);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Todo updated successfully',
      data: result,
    });
  },
);

// @desc    Delete
// @route   DELETE /api/admin/todos/:id
// @access  Private/Admin
const removeAdmin: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req?.params;
    const result = await TodoService.removeAdmin(new Types.ObjectId(id));
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Todo deleted successfully',
      data: result,
    });
  },
);

// @desc    Get By Id
// @route   GET /api/admin/users-todos/:id
// @access  Private/Admin
const getAllUserTodosAdmin: RequestHandler = AsyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req?.params;
    const { name, page, pageSize } = req?.query;
    const result = await TodoService.getAllUserTodosAdmin(
      new Types.ObjectId(id),
      String(name || ''),
      Number(page || DEFAULT_CURRENT_PAGE),
      Number(pageSize || DEFAULT_PAGE_SIZE),
    );
    res.status(HttpCode.OK).json({ success: true, message: '', data: result });
  },
);

export default {
  getAll,
  getById,
  create,
  edit,
  remove,
  getAllAdmin,
  getByIdAdmin,
  editAdmin,
  removeAdmin,
  getAllUserTodosAdmin,
};
