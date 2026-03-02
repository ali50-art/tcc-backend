import { Schema, model, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const ROLE_DOCUMENT_NAME = 'Role';
export const ROLE_COLLECTION_NAME = 'roles';

export default interface IRole extends Document {
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IRole>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
      unique: true,
    },
    description: {
      type: Schema.Types.String,
      default: '',
    },
    permissions: [
      {
        type: Schema.Types.String,
      },
    ],
    isActive: {
      type: Schema.Types.Boolean,
      default: true,
    },
  },
  { timestamps: true, versionKey: false },
);

schema.plugin(mongoosePagination);

export const Role = model<IRole, Pagination<IRole>>(
  ROLE_DOCUMENT_NAME,
  schema,
  ROLE_COLLECTION_NAME,
);




