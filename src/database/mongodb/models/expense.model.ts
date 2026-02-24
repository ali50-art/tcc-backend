import { Schema, model, Document } from 'mongoose';
import { ExpenseStatusEnum, ExpenseTypeEnum } from '../../../constants/constants';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const EXPENSE_DOCUMENT_NAME = 'Expense';
export const EXPENSE_COLLECTION_NAME = 'expenses';

export default interface IExpense extends Document {
  user: object;
  type: string;
  description: string;
  amount: number;
  date: Date;
  receipt?: string;
  status: string;
  approvedBy?: object;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IExpense>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: Schema.Types.String,
      required: true,
      enum: Object.values(ExpenseTypeEnum),
      default: ExpenseTypeEnum.autre,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    amount: {
      type: Schema.Types.Number,
      required: true,
    },
    date: {
      type: Schema.Types.Date,
      required: true,
    },
    receipt: {
      type: Schema.Types.String,
      default: '',
    },
    status: {
      type: Schema.Types.String,
      required: true,
      enum: Object.values(ExpenseStatusEnum),
      default: ExpenseStatusEnum.pending,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: {
      type: Schema.Types.String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false },
);

schema.plugin(mongoosePagination);

export const Expense = model<IExpense, Pagination<IExpense>>(
  EXPENSE_DOCUMENT_NAME,
  schema,
  EXPENSE_COLLECTION_NAME,
);




