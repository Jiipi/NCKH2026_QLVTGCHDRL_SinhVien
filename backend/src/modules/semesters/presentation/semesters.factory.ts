import type { PrismaClient } from '@prisma/client';
import SemestersController from './controllers/SemestersController';

// Import use cases with ES module imports
import SemesterPrismaRepository from '../data/repositories/SemesterPrismaRepository';
import GetSemesterOptionsUseCase from '../business/services/GetSemesterOptionsUseCase';
import GetCurrentSemesterUseCase from '../business/services/GetCurrentSemesterUseCase';
import GetAllClassesUseCase from '../business/services/GetAllClassesUseCase';
import GetClassDetailUseCase from '../business/services/GetClassDetailUseCase';
import GetClassStudentsUseCase from '../business/services/GetClassStudentsUseCase';
import GetSemesterStatusUseCase from '../business/services/GetSemesterStatusUseCase';
import ProposeClosureUseCase from '../business/services/ProposeClosureUseCase';
import SoftLockSemesterUseCase from '../business/services/SoftLockSemesterUseCase';
import HardLockSemesterUseCase from '../business/services/HardLockSemesterUseCase';
import RollbackSemesterUseCase from '../business/services/RollbackSemesterUseCase';
import GetActivitiesBySemesterUseCase from '../business/services/GetActivitiesBySemesterUseCase';
import GetRegistrationsBySemesterUseCase from '../business/services/GetRegistrationsBySemesterUseCase';
import CreateNextSemesterUseCase from '../business/services/CreateNextSemesterUseCase';
import ActivateSemesterUseCase from '../business/services/ActivateSemesterUseCase';
import GetCurrentSemesterStatusUseCase from '../business/services/GetCurrentSemesterStatusUseCase';

/**
 * Factory function to create SemestersController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createSemestersController(): SemestersController {
  // Data layer
  const semesterRepository = new SemesterPrismaRepository();
  const getCurrentSemesterUseCase = new GetCurrentSemesterUseCase();

  // Business layer (Use Cases)
  const useCases = {
    getSemesterOptions: new GetSemesterOptionsUseCase(semesterRepository),
    getCurrentSemester: getCurrentSemesterUseCase,
    getAllClasses: new GetAllClassesUseCase(semesterRepository),
    getClassDetail: new GetClassDetailUseCase(semesterRepository),
    getClassStudents: new GetClassStudentsUseCase(semesterRepository),
    getSemesterStatus: new GetSemesterStatusUseCase(),
    proposeClosure: new ProposeClosureUseCase(),
    softLock: new SoftLockSemesterUseCase(),
    hardLock: new HardLockSemesterUseCase(),
    rollback: new RollbackSemesterUseCase(),
    getActivitiesBySemester: new GetActivitiesBySemesterUseCase(semesterRepository),
    getRegistrationsBySemester: new GetRegistrationsBySemesterUseCase(semesterRepository),
    createNextSemester: new CreateNextSemesterUseCase(semesterRepository),
    activateSemester: new ActivateSemesterUseCase(),
    getCurrentSemesterStatus: new GetCurrentSemesterStatusUseCase(getCurrentSemesterUseCase, semesterRepository)
  };

  // Presentation layer
  return new SemestersController(useCases);
}

export { createSemestersController };
module.exports = { createSemestersController };
