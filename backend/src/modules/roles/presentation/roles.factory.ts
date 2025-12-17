import rolesRepository from '../data/repositories/roles.repository';
import ListRolesUseCase from '../business/services/ListRolesUseCase';
import GetRoleByIdUseCase from '../business/services/GetRoleByIdUseCase';
import CreateRoleUseCase from '../business/services/CreateRoleUseCase';
import UpdateRoleUseCase from '../business/services/UpdateRoleUseCase';
import DeleteRoleUseCase from '../business/services/DeleteRoleUseCase';
import AssignRoleToUsersUseCase from '../business/services/AssignRoleToUsersUseCase';
import RolesController from './controllers/RolesController';
import type { RolesUseCases } from './controllers/RolesController';

/**
 * Factory for creating RolesController with all dependencies
 * Implements Dependency Injection pattern
 */
export function createRolesController(): RolesController {
  // Data layer
  const repo = rolesRepository;

  // Business layer (Use Cases)
  const useCases: RolesUseCases = {
    list: new ListRolesUseCase(repo),
    getById: new GetRoleByIdUseCase(repo),
    create: new CreateRoleUseCase(repo),
    update: new UpdateRoleUseCase(repo),
    delete: new DeleteRoleUseCase(repo),
    assignToUsers: new AssignRoleToUsersUseCase(repo)
  };

  // Presentation layer
  const controller = new RolesController(useCases);

  return controller;
}

export default { createRolesController };
module.exports = { createRolesController };
