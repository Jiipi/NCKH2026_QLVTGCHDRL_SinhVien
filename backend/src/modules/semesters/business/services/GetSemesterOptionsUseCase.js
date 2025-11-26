const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { normalizeSemesterFormat, isSameSemester } = require('../../../../core/utils/semester');

/**
 * GetSemesterOptionsUseCase
 * Use case for getting semester options
 * Follows Single Responsibility Principle (SRP)
 */
class GetSemesterOptionsUseCase {
  constructor(semesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute() {
    // Get active semester from metadata
    let activeSemester = null;
    try {
      const fs = require('fs');
      const path = require('path');
      const metadataPath = path.join(process.cwd(), 'data', 'semesters', 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (metadata && metadata.active_semester) {
          activeSemester = metadata.active_semester;
        }
      }
    } catch (e) {
      // ignore metadata read errors
    }

    const options = await this.semesterRepository.getSemesterOptions();

    // Mark active semester - use isSameSemester for format-agnostic comparison
    return options.map(opt => {
      // Use isSameSemester to compare regardless of dash/underscore format
      const isActive = activeSemester && opt.value && isSameSemester(activeSemester, opt.value);
      return {
        ...opt,
        is_active: isActive,
        status: isActive ? 'ACTIVE' : null,
      };
    });
  }
}

module.exports = GetSemesterOptionsUseCase;

