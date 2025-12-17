/**
 * IAuthRepository Interface
 * Contract for authentication data access
 * Follows Dependency Inversion Principle (DIP)
 */

export interface UserData {
  id?: string;
  ten_dn: string;
  email: string;
  ho_ten: string;
  mat_khau: string;
  vai_tro_id: string;
  trang_thai?: string;
  anh_dai_dien?: string | null;
  lan_cuoi_dn?: Date | null;
}

export interface UserWithRole {
  id: string;
  ten_dn: string;
  email: string | null;
  ho_ten: string;
  mat_khau: string;
  trang_thai: string;
  anh_dai_dien: string | null;
  lan_cuoi_dn: Date | null;
  vai_tro: {
    id: string;
    ten_vt: string;
    mo_ta: string | null;
  } | null;
  sinh_vien?: {
    id: string;
    mssv: string;
    lop_id: string | null;
    lop?: {
      id: string;
      ten_lop: string;
      khoa: string | null;
    } | null;
  } | null;
}

export interface RoleData {
  id?: string;
  ten_vt: string;
  mo_ta?: string;
}

export interface StudentData {
  nguoi_dung_id: string;
  mssv: string;
  lop_id?: string;
  ngay_sinh?: Date | null;
  gioi_tinh?: string;
  sdt?: string;
  dia_chi?: string;
}

export interface IAuthRepository {
  findByEmailOrMaso(emailOrMaso: string): Promise<UserWithRole | null>;
  findUserByMaso(maso: string): Promise<UserWithRole | null>;
  findUserByEmail(email: string): Promise<UserWithRole | null>;
  findUserById(id: string): Promise<UserWithRole | null>;
  createUser(userData: UserData): Promise<UserWithRole>;
  updateUser(id: string, updateData: Partial<UserData>): Promise<UserWithRole>;
  findRoleByName(roleName: string): Promise<RoleData | null>;
  createRole(roleData: RoleData): Promise<RoleData>;
  createStudent(studentData: StudentData): Promise<any>;
  countUsers(): Promise<number>;
}

/**
 * Abstract base class for implementations
 */
export abstract class AuthRepositoryBase implements IAuthRepository {
  abstract findByEmailOrMaso(emailOrMaso: string): Promise<UserWithRole | null>;
  abstract findUserByMaso(maso: string): Promise<UserWithRole | null>;
  abstract findUserByEmail(email: string): Promise<UserWithRole | null>;
  abstract findUserById(id: string): Promise<UserWithRole | null>;
  abstract createUser(userData: UserData): Promise<UserWithRole>;
  abstract updateUser(id: string, updateData: Partial<UserData>): Promise<UserWithRole>;
  abstract findRoleByName(roleName: string): Promise<RoleData | null>;
  abstract createRole(roleData: RoleData): Promise<RoleData>;
  abstract createStudent(studentData: StudentData): Promise<any>;
  abstract countUsers(): Promise<number>;
}

export default IAuthRepository;
