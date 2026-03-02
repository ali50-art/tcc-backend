import { Schema, model, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const TODO_DOCUMENT_NAME = 'Todo';
export const TODO_COLLECTION_NAME = 'todos';

export default interface ITodo extends Document {
  name: string;
  description: string;
  isConpleted?: boolean;
  user: object;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<ITodo>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
    },
    isConpleted: {
      type: Schema.Types.Boolean,
      default: false,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      select: false,
    },
  },
  { timestamps: true, versionKey: false },
);

schema.plugin(mongoosePagination);

export const Todo = model<ITodo, Pagination<ITodo>>(
  TODO_DOCUMENT_NAME,
  schema,
  TODO_COLLECTION_NAME,
);
