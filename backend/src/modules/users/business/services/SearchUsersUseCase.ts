import type { NguoiDung } from '@prisma/client';
import type IUserRepository from '../interfaces/IUserRepository';
import { buildScope } from '../../../../app/scopes/scopeBuilder';

interface AuthUser {
  id: string | number;
  role: string;
  class?: string;
}

interface Scope {
  class?: string;
  id?: string | number;
}

/**
 * SearchUsersUseCase
 * Use case for searching users
 * Follows Single Responsibility Principle (SRP)
 */
class SearchUsersUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(searchTerm: string, user: AuthUser): Promise<Partial<NguoiDung>[]> {
    const users = await this.userRepository.search(searchTerm);

    // Apply scope filtering
    const scope: Scope = await buildScope('users', user);
    const filtered = users.filter((u: NguoiDung & { class?: string }) => {
      if (scope.class) return u.class === scope.class;
      if (scope.id) return u.id === scope.id;
      return true;
    });

    // Remove passwords
    const result = filtered.map((u: NguoiDung) => {
      const userCopy = { ...u } as Partial<NguoiDung> & { password?: string };
      delete userCopy.password;
      return userCopy;
    });

    return result;
  }
}

export default SearchUsersUseCase;
module.exports = SearchUsersUseCase;
