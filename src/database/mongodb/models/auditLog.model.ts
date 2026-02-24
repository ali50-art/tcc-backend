import { Schema, model, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';

export const AUDITLOG_DOCUMENT_NAME = 'AuditLog';
export const AUDITLOG_COLLECTION_NAME = 'auditlogs';

export default interface IAuditLog extends Document {
  user: object;
  action: string;
  entity: string;
  entityId?: object;
  details: string;
  ipAddress?: string;
  createdAt?: Date;
}

const schema = new Schema<IAuditLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: Schema.Types.String,
      required: true,
    },
    entity: {
      type: Schema.Types.String,
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Schema.Types.String,
      default: '',
    },
    ipAddress: {
      type: Schema.Types.String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false },
);

schema.plugin(mongoosePagination);

export const AuditLog = model<IAuditLog, Pagination<IAuditLog>>(
  AUDITLOG_DOCUMENT_NAME,
  schema,
  AUDITLOG_COLLECTION_NAME,
);




