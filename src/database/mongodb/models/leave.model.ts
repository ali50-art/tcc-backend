import { Schema, model, Document } from 'mongoose';
import { LeaveStatusEnum, LeaveTypeEnum } from '../../../constants/constants';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const LEAVE_DOCUMENT_NAME = 'Leave';
export const LEAVE_COLLECTION_NAME = 'leaves';

export default interface ILeave extends Document {
  user: object;
  type: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: string;
  approvedBy?: object;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<ILeave>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: Schema.Types.String,
      required: true,
      enum: Object.values(LeaveTypeEnum),
      default: LeaveTypeEnum.cp,
    },
    startDate: {
      type: Schema.Types.Date,
      required: true,
    },
    endDate: {
      type: Schema.Types.Date,
      required: true,
    },
    reason: {
      type: Schema.Types.String,
      default: '',
    },
    status: {
      type: Schema.Types.String,
      required: true,
      enum: Object.values(LeaveStatusEnum),
      default: LeaveStatusEnum.pending,
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

export const Leave = model<ILeave, Pagination<ILeave>>(
  LEAVE_DOCUMENT_NAME,
  schema,
  LEAVE_COLLECTION_NAME,
);




