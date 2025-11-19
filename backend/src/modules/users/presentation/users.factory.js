const UserPrismaRepository = require('../infrastructure/repositories/UserPrismaRepository');
const ListUsersUseCase = require('../application/use-cases/ListUsersUseCase');
const GetUserByIdUseCase = require('../application/use-cases/GetUserByIdUseCase');
const CreateUserUseCase = require('../application/use-cases/CreateUserUseCase');
const UpdateUserUseCase = require('../application/use-cases/UpdateUserUseCase');
const DeleteUserUseCase = require('../application/use-cases/DeleteUserUseCase');
const SearchUsersUseCase = require('../application/use-cases/SearchUsersUseCase');
const GetUserStatsUseCase = require('../application/use-cases/GetUserStatsUseCase');
const GetUsersByClassUseCase = require('../application/use-cases/GetUsersByClassUseCase');
const UsersController = require('./UsersController');

/**
 * Factory function to create UsersController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createUsersController() {
  const userRepository = new UserPrismaRepository();

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

  return new UsersController(useCases);
}

module.exports = { createUsersController };

