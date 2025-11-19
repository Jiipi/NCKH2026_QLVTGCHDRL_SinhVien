const AdminUserPrismaRepository = require('../infrastructure/repositories/AdminUserPrismaRepository');
const BcryptHashService = require('../infrastructure/services/BcryptHashService');
const GetUsersUseCase = require('../application/use-cases/GetUsersUseCase');
const GetUserByIdUseCase = require('../application/use-cases/GetUserByIdUseCase');
const CreateUserUseCase = require('../application/use-cases/CreateUserUseCase');
const UpdateUserUseCase = require('../application/use-cases/UpdateUserUseCase');
const DeleteUserUseCase = require('../application/use-cases/DeleteUserUseCase');
const ExportUsersUseCase = require('../application/use-cases/ExportUsersUseCase');
const AdminUsersController = require('./AdminUsersController');

/**
 * Factory for creating AdminUsersController with all dependencies
 * Implements Dependency Injection pattern
 */
function createAdminUsersController() {
  // Infrastructure layer
  const adminUserRepository = new AdminUserPrismaRepository();
  const hashService = new BcryptHashService();

  // Application layer (Use Cases)
  const getUsersUseCase = new GetUsersUseCase(adminUserRepository);
  const getUserByIdUseCase = new GetUserByIdUseCase(adminUserRepository);
  const createUserUseCase = new CreateUserUseCase(adminUserRepository, hashService);
  const updateUserUseCase = new UpdateUserUseCase(adminUserRepository, hashService);
  const deleteUserUseCase = new DeleteUserUseCase(adminUserRepository);
  const exportUsersUseCase = new ExportUsersUseCase(adminUserRepository);

  // Presentation layer
  const controller = new AdminUsersController(
    getUsersUseCase,
    getUserByIdUseCase,
    createUserUseCase,
    updateUserUseCase,
    deleteUserUseCase,
    exportUsersUseCase
  );

  return controller;
}

module.exports = { createAdminUsersController };

