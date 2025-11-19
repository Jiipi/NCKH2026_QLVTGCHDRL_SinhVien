const SemesterPrismaRepository = require('../infrastructure/repositories/SemesterPrismaRepository');
const GetSemesterOptionsUseCase = require('../application/use-cases/GetSemesterOptionsUseCase');
const GetCurrentSemesterUseCase = require('../application/use-cases/GetCurrentSemesterUseCase');
const GetAllClassesUseCase = require('../application/use-cases/GetAllClassesUseCase');
const GetClassDetailUseCase = require('../application/use-cases/GetClassDetailUseCase');
const GetClassStudentsUseCase = require('../application/use-cases/GetClassStudentsUseCase');
const GetSemesterStatusUseCase = require('../application/use-cases/GetSemesterStatusUseCase');
const ProposeClosureUseCase = require('../application/use-cases/ProposeClosureUseCase');
const SoftLockSemesterUseCase = require('../application/use-cases/SoftLockSemesterUseCase');
const HardLockSemesterUseCase = require('../application/use-cases/HardLockSemesterUseCase');
const RollbackSemesterUseCase = require('../application/use-cases/RollbackSemesterUseCase');
const GetActivitiesBySemesterUseCase = require('../application/use-cases/GetActivitiesBySemesterUseCase');
const GetRegistrationsBySemesterUseCase = require('../application/use-cases/GetRegistrationsBySemesterUseCase');
const CreateNextSemesterUseCase = require('../application/use-cases/CreateNextSemesterUseCase');
const ActivateSemesterUseCase = require('../application/use-cases/ActivateSemesterUseCase');
const GetCurrentSemesterStatusUseCase = require('../application/use-cases/GetCurrentSemesterStatusUseCase');
const SemestersController = require('./SemestersController');

/**
 * Factory function to create SemestersController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createSemestersController() {
  const semesterRepository = new SemesterPrismaRepository();
  const getCurrentSemesterUseCase = new GetCurrentSemesterUseCase();

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

  return new SemestersController(useCases);
}

module.exports = { createSemestersController };

