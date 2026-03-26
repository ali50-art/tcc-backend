import { Schema, model, Document } from 'mongoose';

export const ATTENDANCE_SCHEDULE_DOCUMENT_NAME = 'AttendanceSchedule';
export const ATTENDANCE_SCHEDULE_COLLECTION_NAME = 'attendance_schedules';

export interface IAttendanceSchedule extends Document {
  key: string;
  workStart: string;
  workEnd: string;
  breakStart: string;
  breakEnd: string;
  graceMinutes: number;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<IAttendanceSchedule>(
  {
    key: { type: String, required: true, unique: true, index: true, default: 'default' },
    workStart: { type: String, required: true, default: '09:00' },
    workEnd: { type: String, required: true, default: '18:00' },
    breakStart: { type: String, required: true, default: '13:00' },
    breakEnd: { type: String, required: true, default: '14:00' },
    graceMinutes: { type: Number, required: true, default: 0 },
    updatedBy: { type: String, default: '' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const AttendanceSchedule = model<IAttendanceSchedule>(
  ATTENDANCE_SCHEDULE_DOCUMENT_NAME,
  schema,
  ATTENDANCE_SCHEDULE_COLLECTION_NAME,
);

