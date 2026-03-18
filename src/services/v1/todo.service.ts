import { ErrorHandler } from '../../utils/errorHandler';
import TodoRepository from '../../database/mongodb/repositories/todo.repository';
import { HttpCode } from '../../utils/httpCode';
import UserRepository from '../../database/mongodb/repositories/user.repository';
import { Types } from 'mongoose';
import ITodo from '../../database/mongodb/models/todo.model';
import { sendMail } from '../../utils/sendMail';
import { RolesEnum } from '../../constants/constants';

const getAll = async (userId: Types.ObjectId, name: string, page: number, pageSize: number) => {
  // create options object to filter data
  const options = {
    page: page,
    limit: pageSize,
  };

  // get docs and meta
  const { docs, ...meta } = await TodoRepository.getAll({ user: userId }, options, { name });

  // return data
  return { docs, meta };
};

const getById = async (userId: Types.ObjectId, id: Types.ObjectId) => {
  // create options object to filter data
  const options = {
    user: userId,
    _id: id,
  };

  // get item by options
  const todo = await TodoRepository.getOneByQuery(options);

  // throw error if item not found
  if (!todo) {
    throw new ErrorHandler('todo not found!', HttpCode.NOT_FOUND);
  }

  // return data
  return todo;
};

const create = async (userId: Types.ObjectId, item: ITodo) => {
  // set current authentificated userid to item
  item.user = userId;
  if (typeof item.isConpleted !== 'boolean') item.isConpleted = false;
  if (!item.slug) (item as any).slug = 'normal';

  // create item
  const createdTodo = await TodoRepository.create(item);

  // return data
  return createdTodo;
};

const createForUserAdmin = async (creatorId: Types.ObjectId, userId: Types.ObjectId, item: ITodo) => {
  const user = await UserRepository.getById(userId);
  if (!user) throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);

  item.user = userId;
  (item as any).createdBy = creatorId;
  if (typeof item.isConpleted !== 'boolean') item.isConpleted = false;
  if (!item.slug) (item as any).slug = 'normal';

  const createdTodo = await TodoRepository.create(item);

  // Email notification to employee
  if (user.email) {
    const due = (createdTodo as any)?.dueDate ? new Date((createdTodo as any).dueDate).toLocaleDateString('fr-FR') : '';
    const slug = (createdTodo as any)?.slug || 'normal';
    const subject = `Nouvelle tâche (${slug.toUpperCase()})`;
    const body = `
      <div style="font-family:Arial, sans-serif; line-height:1.5">
        <h2 style="margin:0 0 12px 0">Nouvelle tâche assignée</h2>
        <p>Bonjour <strong>${user.name}</strong>,</p>
        <p>Une nouvelle tâche vous a été assignée dans <strong>TCC CenterDesk</strong> :</p>
        <ul>
          <li><strong>Titre:</strong> ${(createdTodo as any).name}</li>
          <li><strong>Priorité:</strong> ${slug}</li>
          ${due ? `<li><strong>Date limite:</strong> ${due}</li>` : ''}
          ${(createdTodo as any).description ? `<li><strong>Description:</strong> ${(createdTodo as any).description}</li>` : ''}
        </ul>
        <p>Connectez-vous à l’application pour la consulter.</p>
      </div>
    `;
    try {
      sendMail(user.email, subject, body);
    } catch {}
  }

  return createdTodo;
};

const getMyCreatedTodosByDueRangeAdmin = async (
  creatorId: Types.ObjectId,
  from: Date,
  to: Date,
  includeLegacyWithoutCreator: boolean = true,
) => {
  const creatorFilter = includeLegacyWithoutCreator
    ? {
        $or: [
          { createdBy: creatorId },
          { createdBy: { $exists: false } },
          { createdBy: null },
        ],
      }
    : { createdBy: creatorId };

  const query = {
    ...creatorFilter,
    dueDate: { $gte: from, $lte: to },
  };

  const todos = await TodoRepository.getByQuery(query, '+user +createdBy', 'user createdBy');
  return todos;
};

const edit = async (userId: Types.ObjectId, id: Types.ObjectId, item: ITodo) => {
  // create options object to filter data
  const options = {
    user: userId,
    _id: id,
  };

  // get item by options
  const todo = await TodoRepository.getOneByQuery(options, '+user +createdBy', 'user createdBy');

  // throw error if item not found
  if (!todo) {
    throw new ErrorHandler('todo not found!', HttpCode.NOT_FOUND);
  }

  const wasCompleted = Boolean((todo as any).isConpleted);
  const willBeCompleted = typeof (item as any).isConpleted === 'boolean' ? Boolean((item as any).isConpleted) : wasCompleted;

  // edit item
  const updatedTodo = await TodoRepository.edit(id, item);

  // If employee just completed the task, notify the admin who created it
  if (!wasCompleted && willBeCompleted) {
    const employee = (todo as any).user as any;
    const admins = await UserRepository.getByQuery({ role: RolesEnum.admin });
    const emails = Array.from(
      new Set(
        (admins || [])
          .map((a: any) => String(a?.email || '').trim().toLowerCase())
          .filter((e: string) => !!e),
      ),
    );

    if (emails.length > 0) {
      const due = (todo as any)?.dueDate ? new Date((todo as any).dueDate).toLocaleDateString('fr-FR') : '';
      const slug = (todo as any)?.slug || 'normal';
      const subject = `Tâche terminée (${slug.toUpperCase()})`;
      const body = `
        <div style="font-family:Arial, sans-serif; line-height:1.5">
          <h2 style="margin:0 0 12px 0">Tâche terminée</h2>
          <p>L’employé <strong>${employee?.name || ''}</strong> a terminé une tâche :</p>
          <ul>
            <li><strong>Titre:</strong> ${(todo as any).name}</li>
            <li><strong>Priorité:</strong> ${slug}</li>
            ${due ? `<li><strong>Date limite:</strong> ${due}</li>` : ''}
          </ul>
          <p>Statut : <strong>DONE</strong></p>
        </div>
      `;
      for (const email of emails) {
        try {
          sendMail(email, subject, body);
        } catch {}
      }
    }
  }

  // return data
  return updatedTodo;
};

const remove = async (userId: Types.ObjectId, id: Types.ObjectId) => {
  // create options object to filter data
  const options = {
    user: userId,
    _id: id,
  };

  // get item by options
  const todo = await TodoRepository.getOneByQuery(options);

  // throw error if item not found
  if (!todo) {
    throw new ErrorHandler('todo not found!', HttpCode.NOT_FOUND);
  }

  // remove item
  await TodoRepository.remove(id);

  // return data
  return todo;
};

const getAllAdmin = async (name: string, page: number, pageSize: number) => {
  // create options object to filter data
  const options = {
    page: page,
    limit: pageSize,
  };

  // get docs and meta
  const { docs, ...meta } = await TodoRepository.getAll({}, options, { name });

  // return data
  return { docs, meta };
};

const getByIdAdmin = async (id: Types.ObjectId) => {
  // get item by his id
  const todo = await TodoRepository.getById(id);

  // throw error if item not found
  if (!todo) {
    throw new ErrorHandler('todo not found!', HttpCode.NOT_FOUND);
  }

  // return data
  return todo;
};

const editAdmin = async (id: Types.ObjectId, item: ITodo) => {
  // get item by his id
  const todo = await TodoRepository.getById(id);

  // throw error if item not found
  if (!todo) {
    throw new ErrorHandler('todo not found!', HttpCode.NOT_FOUND);
  }

  // update item
  const updatedTodo = await TodoRepository.edit(id, item);

  // return data
  return updatedTodo;
};

const removeAdmin = async (id: Types.ObjectId) => {
  // get item by his id
  const todo = await TodoRepository.getById(id);

  // throw error if item not found
  if (!todo) {
    throw new ErrorHandler('todo not found!', HttpCode.NOT_FOUND);
  }

  // delete item
  await TodoRepository.remove(id);

  // return data
  return todo;
};

const getAllUserTodosAdmin = async (
  userId: Types.ObjectId,
  name: string,
  page: number,
  pageSize: number,
) => {
  // get user by his id
  const user = await UserRepository.getById(userId);

  // throw error if user not found
  if (!user) {
    throw new ErrorHandler('user not found!', HttpCode.NOT_FOUND);
  }

  // create options object to filter data
  const options = {
    page: page,
    limit: pageSize,
  };

  // get docs and meta
  const { docs, ...meta } = await TodoRepository.getAll({ user: userId }, options, { name });

  // return data
  return { docs, meta };
};

export default {
  getAll,
  getById,
  create,
  createForUserAdmin,
  edit,
  remove,
  getAllAdmin,
  getByIdAdmin,
  editAdmin,
  removeAdmin,
  getAllUserTodosAdmin,
  getMyCreatedTodosByDueRangeAdmin,
};
