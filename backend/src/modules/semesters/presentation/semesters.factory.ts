import type { PrismaClient } from '@prisma/client';
import SemestersController from './controllers/SemestersController';

// Import use cases with ES module interop
const SemesterPrismaRepositoryModule = require('../data/repositories/SemesterPrismaRepository');
const GetSemesterOptionsUseCaseModule = require('../business/services/GetSemesterOptionsUseCase');
const GetCurrentSemesterUseCaseModule = require('../business/services/GetCurrentSemesterUseCase');
const GetAllClassesUseCaseModule = require('../business/services/GetAllClassesUseCase');
const GetClassDetailUseCaseModule = require('../business/services/GetClassDetailUseCase');
const GetClassStudentsUseCaseModule = require('../business/services/GetClassStudentsUseCase');
const GetSemesterStatusUseCaseModule = require('../business/services/GetSemesterStatusUseCase');
const ProposeClosureUseCaseModule = require('../business/services/ProposeClosureUseCase');
const SoftLockSemesterUseCaseModule = require('../business/services/SoftLockSemesterUseCase');
const HardLockSemesterUseCaseModule = require('../business/services/HardLockSemesterUseCase');
const RollbackSemesterUseCaseModule = require('../business/services/RollbackSemesterUseCase');
const GetActivitiesBySemesterUseCaseModule = require('../business/services/GetActivitiesBySemesterUseCase');
const GetRegistrationsBySemesterUseCaseModule = require('../business/services/GetRegistrationsBySemesterUseCase');
const CreateNextSemesterUseCaseModule = require('../business/services/CreateNextSemesterUseCase');
const ActivateSemesterUseCaseModule = require('../business/services/ActivateSemesterUseCase');
const GetCurrentSemesterStatusUseCaseModule = require('../business/services/GetCurrentSemesterStatusUseCase');

// Handle ES module interop - get the actual class from default export or module itself
const SemesterPrismaRepository = SemesterPrismaRepositoryModule.default || SemesterPrismaRepositoryModule;
const GetSemesterOptionsUseCase = GetSemesterOptionsUseCaseModule.default || GetSemesterOptionsUseCaseModule;
const GetCurrentSemesterUseCase = GetCurrentSemesterUseCaseModule.default || GetCurrentSemesterUseCaseModule;
const GetAllClassesUseCase = GetAllClassesUseCaseModule.default || GetAllClassesUseCaseModule;
const GetClassDetailUseCase = GetClassDetailUseCaseModule.default || GetClassDetailUseCaseModule;
const GetClassStudentsUseCase = GetClassStudentsUseCaseModule.default || GetClassStudentsUseCaseModule;
const GetSemesterStatusUseCase = GetSemesterStatusUseCaseModule.default || GetSemesterStatusUseCaseModule;
const ProposeClosureUseCase = ProposeClosureUseCaseModule.default || ProposeClosureUseCaseModule;
const SoftLockSemesterUseCase = SoftLockSemesterUseCaseModule.default || SoftLockSemesterUseCaseModule;
const HardLockSemesterUseCase = HardLockSemesterUseCaseModule.default || HardLockSemesterUseCaseModule;
const RollbackSemesterUseCase = RollbackSemesterUseCaseModule.default || RollbackSemesterUseCaseModule;
const GetActivitiesBySemesterUseCase = GetActivitiesBySemesterUseCaseModule.default || GetActivitiesBySemesterUseCaseModule;
const GetRegistrationsBySemesterUseCase = GetRegistrationsBySemesterUseCaseModule.default || GetRegistrationsBySemesterUseCaseModule;
const CreateNextSemesterUseCase = CreateNextSemesterUseCaseModule.default || CreateNextSemesterUseCaseModule;
const ActivateSemesterUseCase = ActivateSemesterUseCaseModule.default || ActivateSemesterUseCaseModule;
const GetCurrentSemesterStatusUseCase = GetCurrentSemesterStatusUseCaseModule.default || GetCurrentSemesterStatusUseCaseModule;

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
    getActivitiesBySemester: new GetActivitiesBySemesterUseCase(),
    getRegistrationsBySemester: new GetRegistrationsBySemesterUseCase(),
    createNextSemester: new CreateNextSemesterUseCase(),
    activateSemester: new ActivateSemesterUseCase(),
    getCurrentSemesterStatus: new GetCurrentSemesterStatusUseCase(getCurrentSemesterUseCase)
  };

  // Presentation layer
  return new SemestersController(useCases);
}

export { createSemestersController };
module.exports = { createSemestersController };
