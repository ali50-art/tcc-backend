import { Router } from 'express';

const router: Router = Router();

import Authorization from '../../middlewares/auth';
import AuthorizeRole from '../../middlewares/authorizeRole';

import TodoValidator from '../../validators/todo.validator';
import validator from '../../validators';

import TodoController from '../../controllers/v1/todo.controller';
import { RolesEnum } from '../../constants/constants';

router
  .route('/todos')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.user, RolesEnum.admin]),
    TodoController.getAll,
  )
  .post(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.user, RolesEnum.admin]),
    validator(TodoValidator.todoSchema),
    TodoController.create,
  );

router
  .route('/todos/:id')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.user, RolesEnum.admin]),
    TodoController.getById,
  )
  .put(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.user, RolesEnum.admin]),
    validator(TodoValidator.todoSchema),
    TodoController.edit,
  )
  .delete(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.user, RolesEnum.admin]),
    TodoController.remove,
  );

router
  .route('/admin/todos')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    TodoController.getAllAdmin,
  );

router
  .route('/admin/todos/:id')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    TodoController.getByIdAdmin,
  )
  .put(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    validator(TodoValidator.todoSchema),
    TodoController.editAdmin,
  )
  .delete(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    TodoController.removeAdmin,
  );

router
  .route('/admin/users-todos/:id')
  .get(
    Authorization.Authenticated,
    AuthorizeRole.AuthorizeRole([RolesEnum.admin]),
    TodoController.getAllUserTodosAdmin,
  );

export default router;
