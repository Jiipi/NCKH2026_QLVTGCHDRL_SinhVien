import type { NguoiDung, VaiTro, Prisma } from '@prisma/client';

/**
 * User select type for queries
 */
export type UserSelect = Prisma.NguoiDungSelect;

/**
 * User where input type for filtering
 */
export type UserWhereInput = Prisma.NguoiDungWhereInput;

/**
 * User order by input type for sorting
 */
export type UserOrderByInput = Prisma.NguoiDungOrderByWithRelationInput;

/**
 * User create input type
 */
export type UserCreateInput = Prisma.NguoiDungCreateInput;

/**
 * User update input type
 */
export type UserUpdateInput = Prisma.NguoiDungUpdateInput;

/**
 * Find many options interface
 */
export interface FindManyOptions {
  where?: UserWhereInput;
  skip?: number;
  limit?: number;
  orderBy?: UserOrderByInput | UserOrderByInput[];
  select?: UserSelect;
}

/**
 * User statistics interface
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: Record<string, number>;
  [key: string]: unknown;
}

/**
 * IUserRepository
 * Interface for user data access
 * Follows Dependency Inversion Principle (DIP)
 */
abstract class IUserRepository {
  abstract findMany(options: FindManyOptions): Promise<Partial<NguoiDung>[]>;

  abstract findById(id: string, select?: UserSelect): Promise<NguoiDung | null>;

  abstract findByMSSV(mssv: string, select?: UserSelect): Promise<NguoiDung | null>;

  abstract findByEmail(email: string, select?: UserSelect): Promise<NguoiDung | null>;

  abstract create(data: UserCreateInput): Promise<NguoiDung>;

  abstract update(id: string, data: UserUpdateInput): Promise<NguoiDung>;

  abstract softDelete(id: string): Promise<NguoiDung>;

  abstract delete(id: string): Promise<NguoiDung>;

  abstract exists(id: string): Promise<boolean>;

  abstract countByRole(role: VaiTro): Promise<number>;

  abstract findByClass(className: string): Promise<NguoiDung[]>;

  abstract findByFaculty(faculty: string): Promise<NguoiDung[]>;

  abstract search(searchTerm: string): Promise<NguoiDung[]>;

  abstract getStats(): Promise<UserStats>;
}

export default IUserRepository;
module.exports = IUserRepository;
