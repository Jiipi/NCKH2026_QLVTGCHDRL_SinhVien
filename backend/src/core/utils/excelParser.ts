import XLSX from 'xlsx';
import fs from 'fs';
import { prisma } from '../../data/infrastructure/prisma/client';
import bcrypt from 'bcryptjs';
import { GioiTinh, ImportStatus, ImportType } from '@prisma/client';
import { auditIntegrityService } from '../../modules/audit-integrity/services/auditIntegrity.service';

interface ExcelRow {
  [key: string]: string | number | undefined;
}

interface ExistingData {
  mssvs: Set<string>;
  emails: Set<string>;
  usernames: Set<string>;
  classes: Map<string, { id: string; ten_lop: string }>;
}

interface StudentData {
  mssv: string;
  ho_ten: string;
  email: string;
  ngay_sinh: string;
  gt: string;
  lop: string;
  lop_id?: string;
  sdt: string | null;
  dia_chi: string | null;
  ten_dn: string;
  mat_khau: string;
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  data: StudentData | Partial<StudentData>;
}

interface ValidatedStudents {
  valid: StudentData[];
  invalid: Array<Partial<StudentData> & { errors: string[]; rowNumber?: number }>;
}

interface ImportResult {
  imported: number;
  failed: number;
}

interface ImportJobSummary {
  id: string;
  type: ImportType;
  status: ImportStatus;
  filename: string;
  total_rows: number;
  valid_rows: number;
  invalid_rows: number;
  created_at: Date;
  completed_at: Date | null;
}

interface ImportActor {
  userId: string;
  requestId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Parse Excel or CSV file
 * @param filePath - Path to uploaded file
 * @returns Array of parsed rows
 */
export function parseExcelFile(filePath: string): ExcelRow[] {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const data = XLSX.utils.sheet_to_json<ExcelRow>(worksheet, {
      raw: false,
      defval: ''
    });

    return data;
  } catch (error) {
    console.error('Parse Excel error:', error);
    throw new Error('Không thể đọc file Excel. Vui lòng kiểm tra định dạng file.');
  }
}

function parseDateFlexible(value: unknown): Date | null {
  if (!value && value !== 0) return null;
  if (value instanceof Date) return value;
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value.trim()))) {
    const serial = typeof value === 'number' ? value : parseInt(value.trim(), 10);
    if (!Number.isNaN(serial)) {
      const excelEpoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(excelEpoch.getTime() + serial * 24 * 60 * 60 * 1000);
    }
  }
  if (typeof value === 'string') {
    let s = value.trim().replace(/^"|"$/g, '');
    s = s.replace(/\s+/g, ' ');
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
      const [yyyy, mm, dd] = s.split('-').map(n => parseInt(n, 10));
      return new Date(Date.UTC(yyyy, mm - 1, dd));
    }
    if (/^\d{4}[\/.]\d{1,2}[\/.]\d{1,2}$/.test(s)) {
      const parts = s.split(/[\/.]/).map(n => parseInt(n, 10));
      return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    }
    if (/^\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{4}$/.test(s)) {
      const parts = s.split(/[\/.\-]/).map(n => parseInt(n, 10));
      return new Date(Date.UTC(parts[2], parts[1] - 1, parts[0]));
    }
    const tryDate = new Date(s);
    if (!isNaN(tryDate.getTime())) return tryDate;
  }
  return null;
}

export async function validateStudentRow(
  row: ExcelRow,
  existingData: ExistingData
): Promise<ValidationResult> {
  const errors: string[] = [];

  const mssv = (row['MSSV'] || row['mssv'] || '').toString().trim();
  const ho_ten = (row['Họ và tên'] || row['ho_ten'] || row['Họ tên'] || '').toString().trim();
  const email = (row['Email'] || row['email'] || '').toString().trim().toLowerCase();
  const ngay_sinh_raw = row['Ngày sinh (YYYY-MM-DD)'] ?? row['Ngày sinh'] ?? row['ngay_sinh'] ?? '';
  const ngay_sinh = (typeof ngay_sinh_raw === 'string') ? ngay_sinh_raw.trim() : ngay_sinh_raw;
  let gioi_tinh = (row['Giới tính (nam/nu/khac)'] || row['Giới tính'] || row['gioi_tinh'] || row['gt'] || '').toString().trim().toLowerCase();
  const lop = (row['Lớp'] || row['lop'] || row['Lop'] || '').toString().trim();
  const sdt = (row['Số điện thoại'] || row['SĐT'] || row['sdt'] || '').toString().trim();
  const dia_chi = (row['Địa chỉ'] || row['dia_chi'] || '').toString().trim();
  const ten_dang_nhap = (row['Tên đăng nhập'] || row['ten_dang_nhap'] || row['ten_dn'] || mssv).toString().trim();
  const mat_khau_raw = (row['Mật khẩu'] || row['mat_khau'] || '').toString().trim();
  // Default password if column is omitted from the simplified template (mssv-based, must be changed on first login)
  const mat_khau = mat_khau_raw || `dlu@${mssv}`;

  if (!mssv) errors.push('MSSV không được để trống');
  if (!ho_ten) errors.push('Họ tên không được để trống');
  if (!email) errors.push('Email không được để trống');
  if (!ngay_sinh) errors.push('Ngày sinh không được để trống');
  if (!gioi_tinh) errors.push('Giới tính không được để trống');
  if (!lop) errors.push('Lớp không được để trống');

  if (errors.length > 0) {
    return { valid: false, errors, data: { mssv, ho_ten, email, lop } as Partial<StudentData> };
  }

  if (existingData.mssvs.has(mssv)) {
    errors.push('MSSV đã tồn tại trong hệ thống');
  }

  if (!email.endsWith('@dlu.edu.vn')) {
    errors.push('Email phải có đuôi @dlu.edu.vn');
  }
  if (existingData.emails.has(email)) {
    errors.push('Email đã tồn tại trong hệ thống');
  }
  if (existingData.usernames.has(ten_dang_nhap)) {
    errors.push('Tên đăng nhập đã tồn tại trong hệ thống');
  }

  const parsedDate = parseDateFlexible(ngay_sinh);
  if (!parsedDate || isNaN(parsedDate.getTime())) {
    try {
      console.warn('[Import] Invalid ngay_sinh value:', {
        raw: ngay_sinh,
        type: typeof ngay_sinh
      });
    } catch (_) {}
    errors.push('Ngày sinh phải có định dạng hợp lệ. Chấp nhận: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, hoặc định dạng ngày của Excel.');
  }

  const genderMap = new Map<string, string>([
    ['nam', 'nam'], ['nàm', 'nam'], ['male', 'nam'],
    ['nu', 'nu'], ['nữ', 'nu'], ['female', 'nu'],
    ['khac', 'khac'], ['khác', 'khac'], ['other', 'khac']
  ]);
  gioi_tinh = genderMap.get(gioi_tinh) || gioi_tinh;
  const validGenders = ['nam', 'nu', 'khac'];
  if (!validGenders.includes(gioi_tinh)) {
    errors.push('Giới tính phải là: nam, nu, hoặc khac');
  }

  const lopObj = existingData.classes.get(lop);
  if (!lopObj) {
    errors.push(`Lớp "${lop}" không tồn tại trong hệ thống`);
  }

  const isValid = errors.length === 0;

  return {
    valid: isValid,
    errors: isValid ? undefined : errors,
    data: {
      mssv,
      ho_ten,
      email,
      ngay_sinh: parsedDate ? parsedDate.toISOString().slice(0, 10) : (typeof ngay_sinh === 'string' ? ngay_sinh : ''),
      gt: gioi_tinh,
      lop,
      lop_id: lopObj?.id,
      sdt: sdt || null,
      dia_chi: dia_chi || null,
      ten_dn: ten_dang_nhap,
      mat_khau
    }
  };
}

export async function validateStudents(rows: ExcelRow[]): Promise<ValidatedStudents> {
  const [existingStudents, existingUsers, classes] = await Promise.all([
    prisma.sinhVien.findMany({ select: { mssv: true, email: true } }),
    prisma.nguoiDung.findMany({ select: { email: true, ten_dn: true } }),
    prisma.lop.findMany({ select: { id: true, ten_lop: true } })
  ]);

  const existingData: ExistingData = {
    mssvs: new Set(existingStudents.map(s => s.mssv)),
    emails: new Set([
      ...existingStudents.map(s => s.email).filter((e): e is string => e !== null),
      ...existingUsers.map(u => u.email).filter((e): e is string => e !== null)
    ]),
    usernames: new Set(existingUsers.map(u => u.ten_dn)),
    classes: new Map(classes.map(c => [c.ten_lop, c]))
  };

  const valid: StudentData[] = [];
  const invalid: Array<Partial<StudentData> & { errors: string[]; rowNumber?: number }> = [];

  for (const [index, row] of rows.entries()) {
    const result = await validateStudentRow(row, existingData);

    if (result.valid && result.data) {
      const studentData = result.data as StudentData;
      valid.push(studentData);
      existingData.mssvs.add(studentData.mssv);
      existingData.emails.add(studentData.email);
      existingData.usernames.add(studentData.ten_dn);
    } else {
      invalid.push({
        ...result.data,
        rowNumber: index + 2,
        errors: result.errors || []
      });
    }
  }

  return { valid, invalid };
}

export async function createImportJob(input: {
  actorId: string;
  filename: string;
  type?: ImportType;
  totalRows?: number;
  previewPayload?: ValidatedStudents;
}) {
  return prisma.importJob.create({
    data: {
      type: input.type || ImportType.student,
      filename: input.filename,
      status: ImportStatus.pending,
      total_rows: input.totalRows || 0,
      preview_payload: input.previewPayload ? JSON.parse(JSON.stringify(input.previewPayload)) : undefined,
      created_by: input.actorId
    }
  });
}

export async function completeImportJob(jobId: string, input: {
  validRows: number;
  invalidRows: number;
  status: ImportStatus;
  errors?: Array<{ rowNumber: number; message: string; field?: string | null; rawValue?: string | null }>;
}) {
  return prisma.$transaction(async (tx) => {
    await tx.importJob.update({
      where: { id: jobId },
      data: {
        valid_rows: input.validRows,
        invalid_rows: input.invalidRows,
        status: input.status,
        completed_at: input.status === ImportStatus.pending ? null : new Date()
      }
    });

    await tx.importJobError.deleteMany({ where: { import_job_id: jobId } });

    if (input.errors?.length) {
      await tx.importJobError.createMany({
        data: input.errors.map((error) => ({
          import_job_id: jobId,
          row_number: error.rowNumber,
          field: error.field || null,
          message: error.message,
          raw_value: error.rawValue || null,
        }))
      });
    }
  });
}

export async function getRecentImportJobs(limit = 20): Promise<ImportJobSummary[]> {
  return prisma.importJob.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
    select: {
      id: true,
      type: true,
      status: true,
      filename: true,
      total_rows: true,
      valid_rows: true,
      invalid_rows: true,
      created_at: true,
      completed_at: true,
    }
  });
}

export async function getImportJob(jobId: string) {
  return prisma.importJob.findUnique({
    where: { id: jobId },
    include: { errors: { orderBy: { row_number: 'asc' } } }
  });
}

export async function confirmStudentImportJob(jobId: string, actor: ImportActor): Promise<ImportResult & { invalid: ValidatedStudents['invalid'] }> {
  const job = await getImportJob(jobId);
  if (!job) {
    throw new Error('Không tìm thấy import job');
  }
  if (job.created_by !== actor.userId) {
    throw new Error('Không có quyền xác nhận import job này');
  }
  if (job.status !== ImportStatus.pending) {
    throw new Error('Import job đã được xử lý');
  }

  const payload = job.preview_payload as unknown as ValidatedStudents | null;
  const valid = payload?.valid || [];
  const invalid = payload?.invalid || [];

  if (valid.length === 0) {
    await completeImportJob(jobId, {
      validRows: 0,
      invalidRows: invalid.length,
      status: ImportStatus.failed,
      errors: invalid.map(inv => ({
        rowNumber: inv.rowNumber || 0,
        message: inv.errors.join(', '),
        rawValue: JSON.stringify(inv)
      }))
    });
    return { imported: 0, failed: invalid.length, invalid };
  }

  await prisma.importJob.update({ where: { id: jobId }, data: { status: ImportStatus.processing } });
  const { imported, failed } = await importStudents(valid, actor, jobId);
  await completeImportJob(jobId, {
    validRows: imported,
    invalidRows: failed + invalid.length,
    status: failed > 0 ? ImportStatus.failed : ImportStatus.completed,
    errors: invalid.map(inv => ({
      rowNumber: inv.rowNumber || 0,
      message: inv.errors.join(', '),
      rawValue: JSON.stringify(inv)
    }))
  });

  return { imported, failed, invalid };
}

export async function importStudents(students: StudentData[], actor?: ImportActor, jobId?: string): Promise<ImportResult> {
  let imported = 0;
  let failed = 0;

  let studentRole = await prisma.vaiTro.findFirst({
    where: { ten_vt: { in: ['SINH_VIEN', 'SINH_VIÊN'] } }
  });
  if (!studentRole) {
    studentRole = await prisma.vaiTro.create({
      data: { ten_vt: 'SINH_VIEN', mo_ta: 'Vai trò Sinh viên' }
    });
  }

  for (const student of students) {
    try {
      const hashedPassword = await bcrypt.hash(student.mat_khau, 10);

      const createdStudent = await prisma.$transaction(async (tx) => {
        const user = await tx.nguoiDung.create({
          data: {
            ten_dn: student.ten_dn,
            mat_khau: hashedPassword,
            email: student.email,
            ho_ten: student.ho_ten,
            vai_tro_id: studentRole!.id,
            trang_thai: 'hoat_dong'
          }
        });

        return tx.sinhVien.create({
          data: {
            nguoi_dung_id: user.id,
            mssv: student.mssv,
            ngay_sinh: new Date(student.ngay_sinh),
            gt: student.gt as GioiTinh,
            lop_id: student.lop_id!,
            dia_chi: student.dia_chi,
            sdt: student.sdt,
            email: student.email
          }
        });
      });

      imported++;
      console.log(`✓ Imported student: ${student.mssv} - ${student.ho_ten}`);

      if (actor) {
        await auditIntegrityService.appendEvent(prisma, {
          chainScope: 'import:student',
          entityType: 'ImportStudent',
          entityId: createdStudent.id,
          action: 'import_student',
          actorId: actor.userId,
          requestId: actor.requestId || null,
          ipAddress: actor.ipAddress || null,
          userAgent: actor.userAgent || null,
          payload: {
            jobId: jobId || null,
            mssv: student.mssv,
            ho_ten: student.ho_ten,
            email: student.email,
            lop_id: student.lop_id || null,
          }
        });
      }
    } catch (error) {
      console.error(`✗ Failed to import student ${student.mssv}:`, (error as Error).message);
      failed++;
    }
  }

  return { imported, failed };
}

export function cleanupFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

module.exports = {
  parseExcelFile,
  validateStudentRow,
  validateStudents,
  createImportJob,
  completeImportJob,
  getRecentImportJobs,
  getImportJob,
  confirmStudentImportJob,
  importStudents,
  cleanupFile
};
