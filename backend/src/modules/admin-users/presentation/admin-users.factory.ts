/**
 * Factory for creating AdminUsersController with all dependencies
 * Implements Dependency Injection pattern
 */

import AdminUserPrismaRepository from '../data/repositories/AdminUserPrismaRepository';
import BcryptHashService from '../business/services/BcryptHashService';
import GetUsersUseCase from '../business/services/GetUsersUseCase';
import GetUserByIdUseCase from '../business/services/GetUserByIdUseCase';
import CreateUserUseCase from '../business/services/CreateUserUseCase';
import UpdateUserUseCase from '../business/services/UpdateUserUseCase';
import DeleteUserUseCase from '../business/services/DeleteUserUseCase';
import ExportUsersUseCase from '../business/services/ExportUsersUseCase';
import AdminUsersController from './controllers/AdminUsersController';

export function createAdminUsersController(): AdminUsersController {
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
