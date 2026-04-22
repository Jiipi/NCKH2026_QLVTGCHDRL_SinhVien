import type ClassesController from './controllers/ClassesController';
import type { ClassUseCases } from './controllers/ClassesController';

import classesRepository from '../data/repositories/classes.repository';
import ListClassesUseCase from '../business/services/ListClassesUseCase';
import GetClassByIdUseCase from '../business/services/GetClassByIdUseCase';
import CreateClassUseCase from '../business/services/CreateClassUseCase';
import UpdateClassUseCase from '../business/services/UpdateClassUseCase';
import DeleteClassUseCase from '../business/services/DeleteClassUseCase';
import AssignTeacherUseCase from '../business/services/AssignTeacherUseCase';
import GetClassStudentsUseCase from '../business/services/GetClassStudentsUseCase';
import GetClassActivitiesUseCase from '../business/services/GetClassActivitiesUseCase';
import ClassesControllerModule from './controllers/ClassesController';

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
