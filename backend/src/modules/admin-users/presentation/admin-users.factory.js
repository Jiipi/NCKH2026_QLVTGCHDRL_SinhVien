const AdminUserPrismaRepository = require('../data/repositories/AdminUserPrismaRepository');
const BcryptHashService = require('../business/services/BcryptHashService');
const GetUsersUseCase = require('../business/services/GetUsersUseCase');
const GetUserByIdUseCase = require('../business/services/GetUserByIdUseCase');
const CreateUserUseCase = require('../business/services/CreateUserUseCase');
const UpdateUserUseCase = require('../business/services/UpdateUserUseCase');
const DeleteUserUseCase = require('../business/services/DeleteUserUseCase');
const ExportUsersUseCase = require('../business/services/ExportUsersUseCase');
const AdminUsersController = require('./controllers/AdminUsersController');

/**
 * Factory for creating AdminUsersController with all dependencies
 * Implements Dependency Injection pattern
 */
function createAdminUsersController() {
  // Data layer
  const adminUserRepository = new AdminUserPrismaRepository();
  const hashService = new BcryptHashService();

  // Business layer (Use Cases)
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

