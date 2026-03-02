import { Schema, model, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const MESSAGE_DOCUMENT_NAME = 'Message';
export const MESSAGE_COLLECTION_NAME = 'messages';

export default interface IMessage extends Document {
  conversation: object;
  sender: object;
  content: string;
  isRead: boolean;
  readBy: object[];
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: Schema.Types.String,
      required: true,
    },
    isRead: {
      type: Schema.Types.Boolean,
      default: false,
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true, versionKey: false },
);

schema.plugin(mongoosePagination);

export const Message = model<IMessage, Pagination<IMessage>>(
  MESSAGE_DOCUMENT_NAME,
  schema,
  MESSAGE_COLLECTION_NAME,
);




