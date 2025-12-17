import type { NguoiDung, VaiTro } from '@prisma/client';
import IUserRepository, {
  FindManyOptions,
  UserSelect,
  UserCreateInput,
  UserUpdateInput,
  UserStats,
} from '../../business/interfaces/IUserRepository';
const usersRepo = require('./users.repository');

/**
 * UserPrismaRepository
 * Prisma implementation of IUserRepository
 * Follows Dependency Inversion Principle (DIP)
 */
class UserPrismaRepository extends IUserRepository {
  async findMany(options: FindManyOptions): Promise<Partial<NguoiDung>[]> {
    const { where, skip, limit, orderBy, select } = options;
    const result = await usersRepo.findMany({ where, skip, limit, orderBy, select });
    // Return items array to match interface signature
    return result.items || result;
  }

  async findById(id: string, select?: UserSelect): Promise<NguoiDung | null> {
    return usersRepo.findById(id, select);
  }

  async findByMSSV(mssv: string, select?: UserSelect): Promise<NguoiDung | null> {
    return usersRepo.findByMSSV(mssv, select);
  }

  async findByEmail(email: string, select?: UserSelect): Promise<NguoiDung | null> {
    return usersRepo.findByEmail(email, select);
  }

  async create(data: UserCreateInput): Promise<NguoiDung> {
    return usersRepo.create(data);
  }

  async update(id: string, data: UserUpdateInput): Promise<NguoiDung> {
    return usersRepo.update(id, data);
  }

  async softDelete(id: string): Promise<NguoiDung> {
    return usersRepo.softDelete(id);
  }

  async delete(id: string): Promise<NguoiDung> {
    return usersRepo.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return usersRepo.exists(id);
  }

  async countByRole(role: VaiTro): Promise<number> {
    return usersRepo.countByRole(role);
  }

  async findByClass(className: string): Promise<NguoiDung[]> {
    return usersRepo.findByClass(className);
  }

  async findByFaculty(faculty: string): Promise<NguoiDung[]> {
    return usersRepo.findByFaculty(faculty);
  }

  async search(searchTerm: string): Promise<NguoiDung[]> {
    return usersRepo.search(searchTerm);
  }

  async getStats(): Promise<UserStats> {
    return usersRepo.getStats();
  }
}

export default UserPrismaRepository;
module.exports = UserPrismaRepository;
