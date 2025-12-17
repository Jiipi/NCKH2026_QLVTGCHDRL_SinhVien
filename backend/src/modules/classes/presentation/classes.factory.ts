import type ClassesController from './controllers/ClassesController';
import type { ClassUseCases } from './controllers/ClassesController';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const classesRepository = require('../data/repositories/classes.repository');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ListClassesUseCase = require('../business/services/ListClassesUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GetClassByIdUseCase = require('../business/services/GetClassByIdUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const CreateClassUseCase = require('../business/services/CreateClassUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UpdateClassUseCase = require('../business/services/UpdateClassUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const DeleteClassUseCase = require('../business/services/DeleteClassUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const AssignTeacherUseCase = require('../business/services/AssignTeacherUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GetClassStudentsUseCase = require('../business/services/GetClassStudentsUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GetClassActivitiesUseCase = require('../business/services/GetClassActivitiesUseCase');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ClassesControllerModule = require('./controllers/ClassesController');

/**
 * Factory function to create ClassesController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createClassesController(): ClassesController {
  const repo = classesRepository;

  const useCases: ClassUseCases = {
    list: new ListClassesUseCase(repo),
    getById: new GetClassByIdUseCase(repo),
    create: new CreateClassUseCase(repo),
    update: new UpdateClassUseCase(repo),
    delete: new DeleteClassUseCase(repo),
    assignTeacher: new AssignTeacherUseCase(repo),
    getStudents: new GetClassStudentsUseCase(repo),
    getActivities: new GetClassActivitiesUseCase(repo)
  };

  return new ClassesControllerModule(useCases);
}

export { createClassesController };
export default { createClassesController };
module.exports = { createClassesController };
