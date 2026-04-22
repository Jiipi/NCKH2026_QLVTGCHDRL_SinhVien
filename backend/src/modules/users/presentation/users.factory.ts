import type UsersController from './controllers/UsersController';
import UserPrismaRepository from '../data/repositories/UserPrismaRepository';
import ListUsersUseCase from '../business/services/ListUsersUseCase';
import GetUserByIdUseCase from '../business/services/GetUserByIdUseCase';
import CreateUserUseCase from '../business/services/CreateUserUseCase';
import UpdateUserUseCase from '../business/services/UpdateUserUseCase';
import DeleteUserUseCase from '../business/services/DeleteUserUseCase';
import SearchUsersUseCase from '../business/services/SearchUsersUseCase';
import GetUserStatsUseCase from '../business/services/GetUserStatsUseCase';
import GetUsersByClassUseCase from '../business/services/GetUsersByClassUseCase';
import UsersControllerClass from './controllers/UsersController';

/**
 * Factory function to create UsersController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createUsersController(): UsersController {
  // Data layer
  const userRepository = new UserPrismaRepository();

  // Business layer (Use Cases)
  const useCases = {
    list: new ListUsersUseCase(userRepository),
    getById: new GetUserByIdUseCase(userRepository),
    create: new CreateUserUseCase(userRepository),
    update: new UpdateUserUseCase(userRepository),
    delete: new DeleteUserUseCase(userRepository),
    search: new SearchUsersUseCase(userRepository),
    getStats: new GetUserStatsUseCase(userRepository),
    getByClass: new GetUsersByClassUseCase(userRepository)
  };

  // Presentation layer
  return new UsersControllerClass(useCases);
}

export { createUsersController };
export default { createUsersController };
module.exports = { createUsersController };
