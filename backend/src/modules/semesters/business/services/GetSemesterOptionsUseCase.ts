/**
 * GetSemesterOptionsUseCase
 * Use case for getting semester options
 * Follows Single Responsibility Principle (SRP)
 */

import type { SemesterOption } from '../interfaces/ISemesterRepository';
import type ISemesterRepository from '../interfaces/ISemesterRepository';

const SemesterClosure = require('../../../../business/services/semesterClosure.service');
const { normalizeSemesterFormat, isSameSemester } = require('../../../../core/utils/semester');

interface SemesterOptionWithStatus extends SemesterOption {
  value?: string;
  is_active: boolean;
  status: string | null;
}

class GetSemesterOptionsUseCase {
  private semesterRepository: ISemesterRepository;

  constructor(semesterRepository: ISemesterRepository) {
    this.semesterRepository = semesterRepository;
  }

  async execute(): Promise<SemesterOptionWithStatus[]> {
    // Get active semester from metadata
    let activeSemester: string | null = null;
    try {
      const fs = require('fs');
      const path = require('path');
      const metadataPath = path.join(process.cwd(), 'data', 'semesters', 'metadata.json');
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        if (metadata && metadata.active_semester) {
          activeSemester = metadata.active_semester as string;
        }
      }
    } catch (e) {
      // ignore metadata read errors
    }

    const options = await this.semesterRepository.getSemesterOptions();

    // Mark active semester - use isSameSemester for format-agnostic comparison
    return options.map((opt: SemesterOption & { value?: string }) => {
      // Use isSameSemester to compare regardless of dash/underscore format
      const isActive = activeSemester && opt.value && isSameSemester(activeSemester, opt.value);
      return {
        ...opt,
        is_active: !!isActive,
        status: isActive ? 'ACTIVE' : null,
      };
    });
  }
}

export default GetSemesterOptionsUseCase;
module.exports = GetSemesterOptionsUseCase;
