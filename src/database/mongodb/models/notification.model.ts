import { Schema, model, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const NOTIFICATION_DOCUMENT_NAME = 'Notification';
export const NOTIFICATION_COLLECTION_NAME = 'notifications';

export default interface INotification extends Document {
  user: object;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  data?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: Schema.Types.String,
      required: true,
    },
    body: {
      type: Schema.Types.String,
      required: true,
    },
    type: {
      type: Schema.Types.String,
      required: true,
      enum: ['leave', 'expense', 'document', 'message', 'system'],
      default: 'system',
    },
    isRead: {
      type: Schema.Types.Boolean,
      default: false,
    },
    data: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true, versionKey: false },
);

schema.plugin(mongoosePagination);

export const Notification = model<INotification, Pagination<INotification>>(
  NOTIFICATION_DOCUMENT_NAME,
  schema,
  NOTIFICATION_COLLECTION_NAME,
);




