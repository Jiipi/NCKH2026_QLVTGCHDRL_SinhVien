/**
 * Teacher Class Helper
 * Shared helper functions for teacher class operations
 */

const { prisma } = require('../../../../../data/infrastructure/prisma/client');

/**
 * Get classes where teacher is homeroom (chu_nhiem)
 * @param {string} teacherId - Teacher's user ID
 * @returns {Promise<Array>} Array of classes with id and ten_lop
 */
async function findTeacherClassesRaw(teacherId) {
  return prisma.lop.findMany({
    where: { chu_nhiem: teacherId },
    select: { id: true, ten_lop: true }
  });
}

module.exports = {
  findTeacherClassesRaw
};

