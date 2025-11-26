/**
 * ActivateSemesterUseCase
 * Use case for activating a semester
 * Follows Single Responsibility Principle (SRP)
 */

const fs = require('fs');
const path = require('path');
const { normalizeSemesterFormat } = require('../../../../core/utils/semester');

class ActivateSemesterUseCase {
  /**
   * Execute use case
   * @param {string} semester - Semester string (e.g., 'hoc_ky_1_2024' or 'hoc_ky_1-2025' legacy)
   * @param {Object} user - User object with sub/id
   * @returns {Promise<Object>} Result with success flag and data
   */
  async execute(semester, user) {
    // Normalize to standard format: hoc_ky_X_YYYY (underscore)
    const normalizedSemester = normalizeSemesterFormat(semester);
    
    if (!normalizedSemester) {
      return {
        success: false,
        message: 'Format học kỳ không hợp lệ. Ví dụ: hoc_ky_1_2024 hoặc hoc_ky_2_2025',
      };
    }

    const dataDir = path.join(process.cwd(), 'data', 'semesters');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const metadataPath = path.join(dataDir, 'metadata.json');
    
    // Read old active semester
    let oldActive = null;
    try {
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        oldActive = metadata.active_semester;
      }
    } catch (e) {
      // ignore
    }
    
    // Update metadata.json with new active semester (use normalized format)
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(
        {
          active_semester: normalizedSemester,
          updated_at: new Date().toISOString(),
          updated_by: user?.sub || 'admin',
        },
        null,
        2
      )
    );
    
    return {
      success: true,
      message: `Đã kích hoạt học kỳ ${normalizedSemester}`,
      data: {
        new_active: normalizedSemester,
        old_active: oldActive,
      },
    };
  }
}

module.exports = ActivateSemesterUseCase;

