import { Schema, model, Document, Types } from 'mongoose';
import { RolesEnum } from '../../../constants/constants';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const USER_DOCUMENT_NAME = 'User';
export const USER_COLLECTION_NAME = 'users';

export default interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar: string;
  role: RolesEnum;
  department?: string;
  phone?: string;
  address?: string;
  matricule?: string;
  hireDate?: Date;
  contractType?: string;
  cv?: string;
  manager?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'default-user.png',
    },
    role: {
      type: String,
      enum: Object.values(RolesEnum),
      default: RolesEnum.user,
      required: true,
    },
    department: {
      type: String,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    matricule: {
      type: String,
      default: '',
    },
    hireDate: {
      type: Date,
    },
    contractType: {
      type: String,
      default: '',
    },
    cv:{
      type: String,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: USER_DOCUMENT_NAME,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

schema.plugin(mongoosePagination);

export const User = model<IUser, Pagination<IUser>>(
  USER_DOCUMENT_NAME,
  schema,
  USER_COLLECTION_NAME,
);