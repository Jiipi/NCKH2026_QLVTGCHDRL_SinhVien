const classesRepository = require('../data/repositories/classes.repository');
const ListClassesUseCase = require('../business/services/ListClassesUseCase');
const GetClassByIdUseCase = require('../business/services/GetClassByIdUseCase');
const CreateClassUseCase = require('../business/services/CreateClassUseCase');
const UpdateClassUseCase = require('../business/services/UpdateClassUseCase');
const DeleteClassUseCase = require('../business/services/DeleteClassUseCase');
const AssignTeacherUseCase = require('../business/services/AssignTeacherUseCase');
const GetClassStudentsUseCase = require('../business/services/GetClassStudentsUseCase');
const GetClassActivitiesUseCase = require('../business/services/GetClassActivitiesUseCase');
const ClassesController = require('./controllers/ClassesController');

/**
 * Factory function to create ClassesController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createClassesController() {
  const repo = classesRepository;

  const useCases = {
    list: new ListClassesUseCase(repo),
    getById: new GetClassByIdUseCase(repo),
    create: new CreateClassUseCase(repo),
    update: new UpdateClassUseCase(repo),
    delete: new DeleteClassUseCase(repo),
    assignTeacher: new AssignTeacherUseCase(repo),
    getStudents: new GetClassStudentsUseCase(repo),
    getActivities: new GetClassActivitiesUseCase(repo)
  };

  return new ClassesController(useCases);
}

module.exports = { createClassesController };

