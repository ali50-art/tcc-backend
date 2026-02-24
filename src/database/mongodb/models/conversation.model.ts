import { Schema, model, Document } from 'mongoose';

export const CONVERSATION_DOCUMENT_NAME = 'Conversation';
export const CONVERSATION_COLLECTION_NAME = 'conversations';

export default interface IConversation extends Document {
  participants: object[];
  isGroup: boolean;
  name?: string;
  lastMessage?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    isGroup: {
      type: Schema.Types.Boolean,
      default: false,
    },
    name: {
      type: Schema.Types.String,
      default: '',
    },
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true, versionKey: false },
);

export const Conversation = model<IConversation>(
  CONVERSATION_DOCUMENT_NAME,
  schema,
  CONVERSATION_COLLECTION_NAME,
);




