import { Schema, model, Document } from 'mongoose';
import { DocumentCategoryEnum } from '../../../constants/constants';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const DOCUMENT_DOCUMENT_NAME = 'Document';
export const DOCUMENT_COLLECTION_NAME = 'documents';

export default interface IDocument extends Document {
  user: object;
  name: string;
  category: string;
  file: string;
  size: number;
  mimeType: string;
  uploadedBy: object;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: Schema.Types.String,
      required: true,
    },
    category: {
      type: Schema.Types.String,
      required: true,
      enum: Object.values(DocumentCategoryEnum),
      default: DocumentCategoryEnum.autre,
    },
    file: {
      type: Schema.Types.String,
      required: true,
    },
    size: {
      type: Schema.Types.Number,
      default: 0,
    },
    mimeType: {
      type: Schema.Types.String,
      default: '',
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, versionKey: false },
);

schema.plugin(mongoosePagination);

export const Doc = model<IDocument, Pagination<IDocument>>(
  DOCUMENT_DOCUMENT_NAME,
  schema,
  DOCUMENT_COLLECTION_NAME,
);




