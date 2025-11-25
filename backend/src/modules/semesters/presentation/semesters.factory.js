const SemesterPrismaRepository = require('../data/repositories/SemesterPrismaRepository');
const GetSemesterOptionsUseCase = require('../business/services/GetSemesterOptionsUseCase');
const GetCurrentSemesterUseCase = require('../business/services/GetCurrentSemesterUseCase');
const GetAllClassesUseCase = require('../business/services/GetAllClassesUseCase');
const GetClassDetailUseCase = require('../business/services/GetClassDetailUseCase');
const GetClassStudentsUseCase = require('../business/services/GetClassStudentsUseCase');
const GetSemesterStatusUseCase = require('../business/services/GetSemesterStatusUseCase');
const ProposeClosureUseCase = require('../business/services/ProposeClosureUseCase');
const SoftLockSemesterUseCase = require('../business/services/SoftLockSemesterUseCase');
const HardLockSemesterUseCase = require('../business/services/HardLockSemesterUseCase');
const RollbackSemesterUseCase = require('../business/services/RollbackSemesterUseCase');
const GetActivitiesBySemesterUseCase = require('../business/services/GetActivitiesBySemesterUseCase');
const GetRegistrationsBySemesterUseCase = require('../business/services/GetRegistrationsBySemesterUseCase');
const CreateNextSemesterUseCase = require('../business/services/CreateNextSemesterUseCase');
const ActivateSemesterUseCase = require('../business/services/ActivateSemesterUseCase');
const GetCurrentSemesterStatusUseCase = require('../business/services/GetCurrentSemesterStatusUseCase');
const SemestersController = require('./controllers/SemestersController');

/**
 * Factory function to create SemestersController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createSemestersController() {
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

module.exports = { createSemestersController };

