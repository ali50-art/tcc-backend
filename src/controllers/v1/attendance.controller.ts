import { Request, Response } from 'express';
import AsyncHandler from 'express-async-handler';
import { HttpCode } from '../../utils/httpCode';
import DocumentRepository from '../../database/mongodb/repositories/document.repository';
import { DocumentCategoryEnum } from '../../constants/constants';
import { Types } from 'mongoose';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import * as XLSX from 'xlsx';
import UserRepository from '../../database/mongodb/repositories/user.repository';
import { RolesEnum } from '../../constants/constants';
import { sendMail } from '../../utils/sendMail';
import { AttendanceSchedule } from '../../database/mongodb/models/attendanceSchedule.model';
import { AttendanceHistory } from '../../database/mongodb/models/attendanceHistory.model';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

type WorkSchedule = {
  workStart: string; // HH:mm
  workEnd: string; // HH:mm
  breakStart: string; // HH:mm
  breakEnd: string; // HH:mm
  graceMinutes: number;
};

const DEFAULT_SCHEDULE: WorkSchedule = {
  workStart: '09:00',
  workEnd: '18:00',
  breakStart: '13:00',
  breakEnd: '14:00',
  graceMinutes: 0,
};

async function getOrCreateSchedule(): Promise<WorkSchedule> {
  const row = await AttendanceSchedule.findOneAndUpdate(
    { key: 'default' },
    {
      $setOnInsert: {
        key: 'default',
        ...DEFAULT_SCHEDULE,
      },
    },
    { upsert: true, new: true }
  );

  const schedule: WorkSchedule = {
    workStart: row?.workStart || DEFAULT_SCHEDULE.workStart,
    workEnd: row?.workEnd || DEFAULT_SCHEDULE.workEnd,
    breakStart: row?.breakStart || DEFAULT_SCHEDULE.breakStart,
    breakEnd: row?.breakEnd || DEFAULT_SCHEDULE.breakEnd,
    graceMinutes:
      typeof row?.graceMinutes === 'number' ? row.graceMinutes : DEFAULT_SCHEDULE.graceMinutes,
  };
  return schedule;
}

async function resolveDocumentOwner(userIdRaw: any): Promise<Types.ObjectId | null> {
  if (userIdRaw && Types.ObjectId.isValid(userIdRaw)) {
    return new Types.ObjectId(userIdRaw);
  }

  // fallback: first admin/rh user
  const fallbackUser = await UserRepository.getOneByQuery({
    role: { $in: [RolesEnum.admin, RolesEnum.rh] },
  });
  if (fallbackUser?._id) return fallbackUser._id as Types.ObjectId;
  return null;
}

async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  let totalLength = 0;
  for await (const chunk of stream) {
    const u8 =
      chunk instanceof Uint8Array
        ? chunk
        : typeof chunk === 'string'
          ? new TextEncoder().encode(chunk)
          : new Uint8Array(chunk);
    chunks.push(u8);
    totalLength += u8.byteLength;
  }
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return Buffer.from(out);
}

function parseHHmm(s: string): { h: number; m: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(mm) || h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return { h, m: mm };
}

function parseFRDateTime(input: any): Date | null {
  if (input instanceof Date && !Number.isNaN(input.getTime())) return input;
  const s = String(input || '').trim();
  // expected: 24/03/2026 08:57
  const m = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/.exec(s);
  if (!m) return null;
  const dd = Number(m[1]);
  const mo = Number(m[2]);
  const yyyy = Number(m[3]);
  const hh = Number(m[4]);
  const mm = Number(m[5]);
  const d = new Date(yyyy, mo - 1, dd, hh, mm, 0, 0);
  return Number.isNaN(d.getTime()) ? null : d;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function withTime(base: Date, hhmm: string): Date {
  const p = parseHHmm(hhmm);
  if (!p) return base;
  const d = new Date(base);
  d.setHours(p.h, p.m, 0, 0);
  return d;
}

function fmtFRTime(d: Date) {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function fmtFRDate(d: Date) {
  return d.toLocaleDateString('fr-FR');
}

function normalizeHeader(h: any) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[’']/g, "'");
}

function pickCell(row: Record<string, any>, candidates: string[]): any {
  const keys = Object.keys(row);
  for (const c of candidates) {
    const idx = keys.findIndex((k) => normalizeHeader(k) === normalizeHeader(c));
    if (idx >= 0) return row[keys[idx]];
  }
  return undefined;
}

// @desc    Upload attendance Excel from cron script (S3 already handled by multerS3)
// @route   POST /api/admin/attendance-upload
// @access  Protected via x-cron-secret header (no user login)
export const uploadAttendance = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const secretHeader = (req.headers['x-cron-secret'] as string) || '';
  if (!process.env.ATT_UPLOAD_SECRET || secretHeader !== process.env.ATT_UPLOAD_SECRET) {
    res
      .status(HttpCode.UNAUTHORIZED)
      .json({ success: false, message: 'Unauthorized cron request', data: null });
    return;
  }

  const file: any = (req as any).file;
  if (!file?.location) {
    res.status(HttpCode.BAD_REQUEST).json({ success: false, message: 'File required', data: null });
    return;
  }

  const schedule: WorkSchedule = await getOrCreateSchedule();

  // Validate schedule format (fallback to defaults if invalid)
  if (!parseHHmm(schedule.workStart)) schedule.workStart = DEFAULT_SCHEDULE.workStart;
  if (!parseHHmm(schedule.workEnd)) schedule.workEnd = DEFAULT_SCHEDULE.workEnd;
  if (!parseHHmm(schedule.breakStart)) schedule.breakStart = DEFAULT_SCHEDULE.breakStart;
  if (!parseHHmm(schedule.breakEnd)) schedule.breakEnd = DEFAULT_SCHEDULE.breakEnd;
  if (schedule.graceMinutes < 0 || schedule.graceMinutes > 180) schedule.graceMinutes = DEFAULT_SCHEDULE.graceMinutes;

  // Document model requires user -> resolve explicit userId or fallback admin/rh
  const systemUserId = await resolveDocumentOwner(req.body?.userId);
  if (!systemUserId) {
    res.status(HttpCode.BAD_REQUEST).json({
      success: false,
      message: "Aucun utilisateur admin/rh trouvé pour associer le document.",
      data: null,
    });
    return;
  }

  const doc = await DocumentRepository.create({
    user: systemUserId,
    name: file.originalname || 'pointage.xlsx',
    category: DocumentCategoryEnum.autre,
    file: file.location,
    size: file.size,
    mimeType: file.mimetype,
    uploadedBy: systemUserId,
  });

  // ---- XLSX processing (today only) ----
  const bucket = file.bucket || process.env.AWS_BUCKET_NAME;
  const key = file.key;
  let processing: any = { ok: false, reason: null };

  try {
    if (!bucket || !key) {
      processing = { ok: false, reason: 'missing_s3_key_or_bucket' };
    } else {
      const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      const body = obj.Body;
      if (!body) throw new Error('S3 object body empty');
      const buf = await streamToBuffer(body as any);

      const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
      const firstSheet = wb.SheetNames[0];
      if (!firstSheet) throw new Error('No sheet found in XLSX');
      const ws = wb.Sheets[firstSheet];

      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: '' });
      const today = new Date();
      const startTarget = withTime(today, schedule.workStart);
      const breakStartTarget = withTime(today, schedule.breakStart);
      const breakEndTarget = withTime(today, schedule.breakEnd);
      const endTarget = withTime(today, schedule.workEnd);
      const graceMs = schedule.graceMinutes * 60 * 1000;

      // Group punch times by matricule
      const byMat = new Map<string, Date[]>();
      const unknownMat: string[] = [];
      const badRows: number[] = [];

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const mat = String(
          pickCell(r, ['Mat', 'Matricule', 'MAT', 'MATRICULE', 'matricule']) ?? ''
        ).trim();

        const punch = pickCell(r, ['E/S', 'E-S', 'ES', 'E / S', 'Pointage', 'Date/Heure', 'Date Heure']);
        const dt = parseFRDateTime(punch) || (punch instanceof Date ? punch : null);

        if (!mat || !dt) {
          badRows.push(i + 2); // approx excel row (header=1)
          continue;
        }

        // process only "today"
        if (!sameDay(dt, today)) continue;

        if (!byMat.has(mat)) byMat.set(mat, []);
        byMat.get(mat)!.push(dt);
      }

      // Preload admin+rh emails for notifications
      const admins = await UserRepository.getByQuery({ role: { $in: [RolesEnum.admin, RolesEnum.rh] } });
      const adminEmails = (admins || []).map((u: any) => u.email).filter(Boolean);

      const alerts: any[] = [];

      for (const [mat, times] of byMat.entries()) {
        times.sort((a, b) => a.getTime() - b.getTime());

        const user = await UserRepository.getOneByQuery({ matricule: mat });
        if (!user) {
          unknownMat.push(mat);
          continue;
        }

        const emailUser = user.email;
        const nameUser = user.name || 'Utilisateur';

        const [t1, t2, t3, t4] = times;

        // Late start
        if (t1 && t1.getTime() > startTarget.getTime() + graceMs) {
          const subject = `Retard détecté — ${fmtFRDate(today)}`;
          const body = `
            <p>Bonjour <b>${nameUser}</b>,</p>
            <p>Un retard a été détecté pour aujourd’hui (<b>${fmtFRDate(today)}</b>).</p>
            <p>Heure prévue : <b>${schedule.workStart}</b><br/>Heure pointée : <b>${fmtFRTime(t1)}</b></p>
            <p>Merci de vérifier votre pointage.</p>
          `;
          sendMail(emailUser, subject, body);
          for (const a of adminEmails) {
            sendMail(
              a,
              `Alerte retard — ${nameUser} (${mat})`,
              `
                <p>Bonjour,</p>
                <p>Retard détecté pour <b>${nameUser}</b> (matricule <b>${mat}</b>) le <b>${fmtFRDate(today)}</b>.</p>
                <p>Prévu : <b>${schedule.workStart}</b><br/>Pointé : <b>${fmtFRTime(t1)}</b></p>
              `,
            );
          }
          alerts.push({ type: 'retard_debut', matricule: mat, at: t1.toISOString() });
        }

        // Pause: expected t2 around breakStart, t3 around breakEnd
        if (t2 && t2.getTime() > breakStartTarget.getTime() + graceMs) {
          const subject = `Pointage en retard — Pause (${fmtFRDate(today)})`;
          sendMail(
            emailUser,
            subject,
            `
              <p>Bonjour <b>${nameUser}</b>,</p>
              <p>Votre pointage de début de pause semble en retard.</p>
              <p>Heure prévue : <b>${schedule.breakStart}</b><br/>Heure pointée : <b>${fmtFRTime(t2)}</b></p>
            `,
          );
          for (const a of adminEmails) {
            sendMail(
              a,
              `Alerte pause (début) — ${nameUser} (${mat})`,
              `
                <p>Début de pause pointé en retard pour <b>${nameUser}</b> (matricule <b>${mat}</b>).</p>
                <p>Prévu : <b>${schedule.breakStart}</b><br/>Pointé : <b>${fmtFRTime(t2)}</b></p>
              `,
            );
          }
          alerts.push({ type: 'retard_pause_debut', matricule: mat, at: t2.toISOString() });
        }

        if (t3 && t3.getTime() > breakEndTarget.getTime() + graceMs) {
          const subject = `Pointage en retard — Fin de pause (${fmtFRDate(today)})`;
          sendMail(
            emailUser,
            subject,
            `
              <p>Bonjour <b>${nameUser}</b>,</p>
              <p>Votre pointage de fin de pause semble en retard.</p>
              <p>Heure prévue : <b>${schedule.breakEnd}</b><br/>Heure pointée : <b>${fmtFRTime(t3)}</b></p>
            `,
          );
          for (const a of adminEmails) {
            sendMail(
              a,
              `Alerte pause (fin) — ${nameUser} (${mat})`,
              `
                <p>Fin de pause pointée en retard pour <b>${nameUser}</b> (matricule <b>${mat}</b>).</p>
                <p>Prévu : <b>${schedule.breakEnd}</b><br/>Pointé : <b>${fmtFRTime(t3)}</b></p>
              `,
            );
          }
          alerts.push({ type: 'retard_pause_fin', matricule: mat, at: t3.toISOString() });
        }

        // End of day: if t4 exists and is before endTarget -> early leave (optional). If after -> overtime (no alert).
        if (t4 && t4.getTime() < endTarget.getTime() - graceMs) {
          const subject = `Sortie anticipée — ${fmtFRDate(today)}`;
          sendMail(
            emailUser,
            subject,
            `
              <p>Bonjour <b>${nameUser}</b>,</p>
              <p>Une sortie anticipée a été détectée.</p>
              <p>Heure prévue : <b>${schedule.workEnd}</b><br/>Heure pointée : <b>${fmtFRTime(t4)}</b></p>
            `,
          );
          for (const a of adminEmails) {
            sendMail(
              a,
              `Alerte sortie anticipée — ${nameUser} (${mat})`,
              `
                <p>Sortie anticipée pour <b>${nameUser}</b> (matricule <b>${mat}</b>) le <b>${fmtFRDate(today)}</b>.</p>
                <p>Prévu : <b>${schedule.workEnd}</b><br/>Pointé : <b>${fmtFRTime(t4)}</b></p>
              `,
            );
          }
          alerts.push({ type: 'sortie_anticipee', matricule: mat, at: t4.toISOString() });
        }
      }

      // Unknown matricules => notify admins
      if (unknownMat.length && adminEmails.length) {
        const uniq = Array.from(new Set(unknownMat)).sort();
        for (const a of adminEmails) {
          sendMail(
            a,
            `Pointage: matricules inconnus — ${fmtFRDate(today)}`,
            `
              <p>Des matricules présents dans le fichier de pointage n'existent pas dans la base :</p>
              <p><b>${uniq.join(', ')}</b></p>
            `,
          );
        }
      }

      processing = {
        ok: true,
        sheet: firstSheet,
        totalRows: rows.length,
        todayProcessed: byMat.size,
        badRowsCount: badRows.length,
        unknownMatricules: Array.from(new Set(unknownMat)).sort(),
        alertsCount: alerts.length,
        schedule,
      };
    }
  } catch (e: any) {
    processing = { ok: false, reason: e?.message || 'xlsx_processing_failed' };
  }

  // Save pointage history in DB for traceability
  await AttendanceHistory.create({
    uploadedBy: systemUserId,
    user: systemUserId,
    document: doc._id,
    file: doc.file,
    fileName: doc.name,
    fileSize: doc.size,
    mimeType: doc.mimeType,
    schedule,
    processing,
  });

  res.status(HttpCode.CREATED).json({
    success: true,
    message: 'Attendance file uploaded',
    data: { doc, processing },
  });
});

// @desc    Get attendance history list (admin/rh)
// @route   GET /api/admin/attendance-history
// @access  Private (admin/rh)
export const getAttendanceHistory = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(1, Number(req.query?.page || 1));
  const pageSize = Math.min(100, Math.max(1, Number(req.query?.pageSize || 20)));

  const [items, total] = await Promise.all([
    AttendanceHistory.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate('uploadedBy', 'name email role')
      .populate('document', 'name file createdAt'),
    AttendanceHistory.countDocuments({}),
  ]);

  res.status(HttpCode.OK).json({
    success: true,
    message: '',
    data: {
      docs: items,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    },
  });
});

// @desc    Get attendance schedule (admin/rh)
// @route   GET /api/admin/attendance-schedule
// @access  Private (admin/rh)
export const getAttendanceSchedule = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const schedule = await getOrCreateSchedule();
  res.status(HttpCode.OK).json({
    success: true,
    message: '',
    data: schedule,
  });
});

// @desc    Update attendance schedule (admin/rh)
// @route   PUT /api/admin/attendance-schedule
// @access  Private (admin/rh)
export const updateAttendanceSchedule = AsyncHandler(async (req: Request, res: Response): Promise<void> => {
  const payload: WorkSchedule = {
    workStart: String(req.body?.workStart || '').trim(),
    workEnd: String(req.body?.workEnd || '').trim(),
    breakStart: String(req.body?.breakStart || '').trim(),
    breakEnd: String(req.body?.breakEnd || '').trim(),
    graceMinutes: Number(req.body?.graceMinutes ?? 0),
  };

  if (!parseHHmm(payload.workStart) || !parseHHmm(payload.workEnd) || !parseHHmm(payload.breakStart) || !parseHHmm(payload.breakEnd)) {
    res.status(HttpCode.BAD_REQUEST).json({
      success: false,
      message: "Format d'heure invalide (HH:mm attendu).",
      data: null,
    });
    return;
  }

  if (Number.isNaN(payload.graceMinutes) || payload.graceMinutes < 0 || payload.graceMinutes > 180) {
    res.status(HttpCode.BAD_REQUEST).json({
      success: false,
      message: 'graceMinutes doit être entre 0 et 180.',
      data: null,
    });
    return;
  }

  const updated = await AttendanceSchedule.findOneAndUpdate(
    { key: 'default' },
    {
      $set: {
        ...payload,
        updatedBy: req?.user?._id?.toString() || '',
      },
      $setOnInsert: { key: 'default' },
    },
    { upsert: true, new: true }
  );

  res.status(HttpCode.OK).json({
    success: true,
    message: 'Horaires mis à jour.',
    data: {
      workStart: updated?.workStart || payload.workStart,
      workEnd: updated?.workEnd || payload.workEnd,
      breakStart: updated?.breakStart || payload.breakStart,
      breakEnd: updated?.breakEnd || payload.breakEnd,
      graceMinutes:
        typeof updated?.graceMinutes === 'number' ? updated.graceMinutes : payload.graceMinutes,
    },
  });
});

export default {
  uploadAttendance,
  getAttendanceHistory,
  getAttendanceSchedule,
  updateAttendanceSchedule,
};

