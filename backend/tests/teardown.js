/**
 * Jest Global Teardown
 * Runs once after all tests
 */

const { prisma } = require('../src/data/infrastructure/prisma/client');

module.exports = async () => {
  // Close database connections
  if (prisma) {
    await prisma.$disconnect();
  }
  
  console.log('\n✅ Test teardown complete - Database connections closed');
};

