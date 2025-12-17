/**
 * Search Repository
 * Data access layer for search operations
 * Follows Repository Pattern
 */

import { prisma } from '../../../../data/infrastructure/prisma/client';
import type {
  ISearchRepository,
  SearchOptions,
  ActivityResult,
  StudentResult,
  ClassResult,
  TeacherResult,
  StudentRecord,
  ClassCreator,
  ClassHomeroom,
  TeacherClass
} from '../../business/interfaces/ISearchRepository';

class SearchRepository implements ISearchRepository {
  async searchActivities(filters: object, options: SearchOptions = {}): Promise<ActivityResult[]> {
    const { take = 5, orderBy = { ngay_tao: 'desc' } } = options;
    
    return await prisma.hoatDong.findMany({
      where: filters as any,
      select: {
        id: true,
        ten_hd: true,
        mo_ta: true,
        dia_diem: true,
        ngay_bd: true,
        ngay_kt: true,
        diem_rl: true,
        trang_thai: true,
        nguoi_tao: {
          select: {
            ho_ten: true,
            vai_tro: { select: { ten_vt: true } }
          }
        }
      },
      take,
      orderBy
    }) as unknown as ActivityResult[];
  }

  async searchStudents(filters: object, options: SearchOptions = {}): Promise<StudentResult[]> {
    const { take = 5 } = options;
    
    return await prisma.sinhVien.findMany({
      where: filters as any,
      select: {
        nguoi_dung_id: true,
        mssv: true,
        nguoi_dung: {
          select: {
            ho_ten: true,
            email: true,
            anh_dai_dien: true
          }
        },
        lop: {
          select: {
            ten_lop: true
          }
        }
      },
      take
    }) as unknown as StudentResult[];
  }

  async searchClasses(filters: object, options: SearchOptions = {}): Promise<ClassResult[]> {
    const { take = 5 } = options;
    
    return await prisma.lop.findMany({
      where: filters as any,
      select: {
        id: true,
        ten_lop: true,
        chu_nhiem_rel: { select: { ho_ten: true } },
        _count: { select: { sinh_viens: true } }
      },
      take
    }) as unknown as ClassResult[];
  }

  async searchTeachers(filters: object, options: SearchOptions = {}): Promise<TeacherResult[]> {
    const { take = 5 } = options;
    
    return await prisma.nguoiDung.findMany({
      where: filters as any,
      select: {
        id: true,
        ho_ten: true,
        email: true,
        anh_dai_dien: true,
        vai_tro: { select: { ten_vt: true } }
      },
      take
    }) as unknown as TeacherResult[];
  }

  async getStudentByUserId(userId: string): Promise<StudentRecord | null> {
    return await prisma.sinhVien.findUnique({
      where: { nguoi_dung_id: userId },
      select: { id: true, lop_id: true }
    }) as unknown as StudentRecord | null;
  }

  async getClassCreators(classId: string): Promise<ClassCreator[]> {
    return await prisma.sinhVien.findMany({
      where: { lop_id: classId },
      select: { nguoi_dung_id: true }
    }) as unknown as ClassCreator[];
  }

  async getClassHomeroom(classId: string): Promise<ClassHomeroom | null> {
    return await prisma.lop.findUnique({
      where: { id: classId },
      select: { chu_nhiem: true }
    }) as unknown as ClassHomeroom | null;
  }

  async getTeacherClasses(teacherId: string): Promise<TeacherClass[]> {
    return await prisma.lop.findMany({
      where: { chu_nhiem: teacherId },
      select: { id: true }
    }) as unknown as TeacherClass[];
  }
}

const searchRepository = new SearchRepository();
export default searchRepository;
module.exports = searchRepository;
