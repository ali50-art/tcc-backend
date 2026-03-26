import { Schema, model, Document, Types } from 'mongoose';

export const ATTENDANCE_HISTORY_DOCUMENT_NAME = 'AttendanceHistory';
export const ATTENDANCE_HISTORY_COLLECTION_NAME = 'attendance_histories';

export interface IAttendanceHistory extends Document {
  uploadedBy: Types.ObjectId;
  user: Types.ObjectId;
  document: Types.ObjectId;
  file: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  schedule: {
    workStart: string;
    workEnd: string;
    breakStart: string;
    breakEnd: string;
    graceMinutes: number;
  };
  processing?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IAttendanceHistory>(
  {
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    document: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
    file: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: '' },
    schedule: {
      workStart: { type: String, required: true },
      workEnd: { type: String, required: true },
      breakStart: { type: String, required: true },
      breakEnd: { type: String, required: true },
      graceMinutes: { type: Number, required: true, default: 0 },
    },
    processing: { type: Schema.Types.Mixed, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

schema.index({ createdAt: -1 });
schema.index({ uploadedBy: 1, createdAt: -1 });

export const AttendanceHistory = model<IAttendanceHistory>(
  ATTENDANCE_HISTORY_DOCUMENT_NAME,
  schema,
  ATTENDANCE_HISTORY_COLLECTION_NAME,
);

