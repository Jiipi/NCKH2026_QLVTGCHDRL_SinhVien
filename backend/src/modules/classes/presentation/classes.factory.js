const ClassPrismaRepository = require('../infrastructure/repositories/ClassPrismaRepository');
const ListClassesUseCase = require('../application/use-cases/ListClassesUseCase');
const GetClassByIdUseCase = require('../application/use-cases/GetClassByIdUseCase');
const CreateClassUseCase = require('../application/use-cases/CreateClassUseCase');
const UpdateClassUseCase = require('../application/use-cases/UpdateClassUseCase');
const DeleteClassUseCase = require('../application/use-cases/DeleteClassUseCase');
const AssignTeacherUseCase = require('../application/use-cases/AssignTeacherUseCase');
const GetClassStudentsUseCase = require('../application/use-cases/GetClassStudentsUseCase');
const GetClassActivitiesUseCase = require('../application/use-cases/GetClassActivitiesUseCase');
const ClassesController = require('./ClassesController');

/**
 * Factory function to create ClassesController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createClassesController() {
  const classRepository = new ClassPrismaRepository();

  const useCases = {
    list: new ListClassesUseCase(classRepository),
    getById: new GetClassByIdUseCase(classRepository),
    create: new CreateClassUseCase(classRepository),
    update: new UpdateClassUseCase(classRepository),
    delete: new DeleteClassUseCase(classRepository),
    assignTeacher: new AssignTeacherUseCase(classRepository),
    getStudents: new GetClassStudentsUseCase(classRepository),
    getActivities: new GetClassActivitiesUseCase(classRepository)
  };

  return new ClassesController(useCases);
}

module.exports = { createClassesController };

