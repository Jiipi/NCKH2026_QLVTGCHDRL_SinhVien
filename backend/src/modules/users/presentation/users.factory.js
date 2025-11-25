const UserPrismaRepository = require('../data/repositories/UserPrismaRepository');
const ListUsersUseCase = require('../business/services/ListUsersUseCase');
const GetUserByIdUseCase = require('../business/services/GetUserByIdUseCase');
const CreateUserUseCase = require('../business/services/CreateUserUseCase');
const UpdateUserUseCase = require('../business/services/UpdateUserUseCase');
const DeleteUserUseCase = require('../business/services/DeleteUserUseCase');
const SearchUsersUseCase = require('../business/services/SearchUsersUseCase');
const GetUserStatsUseCase = require('../business/services/GetUserStatsUseCase');
const GetUsersByClassUseCase = require('../business/services/GetUsersByClassUseCase');
const UsersController = require('./controllers/UsersController');

/**
 * Factory function to create UsersController with all dependencies
 * Follows Dependency Injection Principle (DIP)
 */
function createUsersController() {
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
  return new UsersController(useCases);
}

module.exports = { createUsersController };

