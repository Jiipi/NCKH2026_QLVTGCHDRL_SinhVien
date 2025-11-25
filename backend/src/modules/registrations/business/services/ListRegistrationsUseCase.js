const ListRegistrationsDto = require('../dto/ListRegistrationsDto');
const { buildScope } = require('../../../../app/scopes/scopeBuilder');
const { parseSemesterString } = require('../../../../core/utils/semester');

/**
 * ListRegistrationsUseCase
 * Use case for listing registrations with filters and pagination
 * Follows Single Responsibility Principle (SRP)
 */
class ListRegistrationsUseCase {
  constructor(registrationRepository) {
    this.registrationRepository = registrationRepository;
  }

  async execute(dto, user) {
    const scope = await buildScope('registrations', user);
    const where = { ...scope };

    if (dto.status) {
      // Map status to legacy schema
      const statusMap = {
        'PENDING': 'cho_duyet',
        'APPROVED': 'da_duyet',
        'REJECTED': 'tu_choi',
        'ATTENDED': 'da_tham_gia',
        'cho_duyet': 'cho_duyet',
        'da_duyet': 'da_duyet',
        'tu_choi': 'tu_choi',
        'da_tham_gia': 'da_tham_gia'
      };
      where.trang_thai_dk = statusMap[dto.status] || dto.status;
    }

    if (dto.activityId) {
      where.hd_id = String(dto.activityId);
    }

    const normalizedLimit = Number.isFinite(dto.limit) && dto.limit > 0 ? dto.limit : null;
    const skip = normalizedLimit ? (dto.page - 1) * normalizedLimit : 0;

    const include = {
      activity: true,
      user: true,
      approvedBy: dto.includeApprover !== false
    };

    if (dto.semester) {
      const parsed = parseSemesterString(dto.semester);
      if (parsed?.year) {
        where.hoat_dong = {
          ...(where.hoat_dong || {}),
          hoc_ky: parsed.semester,
          nam_hoc: {
            contains: parsed.year
          }
        };
      }
    }

    const result = await this.registrationRepository.findMany({
      where,
      skip,
      limit: normalizedLimit || undefined,
      include
    });

    return {
      data: result.items,
      pagination: {
        page: normalizedLimit ? dto.page : 1,
        limit: normalizedLimit || result.items.length,
        total: result.total,
        totalPages: normalizedLimit ? Math.ceil(result.total / normalizedLimit) : 1
      }
    };
  }
}

module.exports = ListRegistrationsUseCase;

