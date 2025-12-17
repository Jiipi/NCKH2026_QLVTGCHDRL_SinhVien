import type IRoleRepository from '../interfaces/IRoleRepository';
import type { VaiTro } from '@prisma/client';

export interface ListRolesOptions {
  page?: number | string;
  limit?: number | string;
  search?: string;
}

interface RoleWithNormalizedPermissions extends VaiTro {
  quyen_han: string[] | null;
}

export interface ListRolesResult {
  items: RoleWithNormalizedPermissions[];
  total: number;
  page: number;
  limit: number;
}

/**
 * ListRolesUseCase
 * Use case for listing roles with pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListRolesUseCase {
  private roleRepository: IRoleRepository;

  constructor(roleRepository: IRoleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(options: ListRolesOptions = {}): Promise<ListRolesResult> {
    const { page = 1, limit = 20, search } = options;

    const { items, total } = await this.roleRepository.findMany({ search }, { page, limit });

    // Convert quyen_han from object to array for all items
    const normalizedItems = items.map(item => {
      const result = item as RoleWithNormalizedPermissions;
      if (result.quyen_han && typeof result.quyen_han === 'object' && !Array.isArray(result.quyen_han)) {
        result.quyen_han = Object.values(result.quyen_han as Record<string, string>);
      }
      return result;
    });

    return {
      items: normalizedItems,
      total,
      page: parseInt(String(page)),
      limit: parseInt(String(limit))
    };
  }
}

export default ListRolesUseCase;
module.exports = ListRolesUseCase;
