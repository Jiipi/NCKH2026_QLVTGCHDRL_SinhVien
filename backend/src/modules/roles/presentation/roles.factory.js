const RolePrismaRepository = require('../infrastructure/repositories/RolePrismaRepository');
const ListRolesUseCase = require('../application/use-cases/ListRolesUseCase');
const GetRoleByIdUseCase = require('../application/use-cases/GetRoleByIdUseCase');
const CreateRoleUseCase = require('../application/use-cases/CreateRoleUseCase');
const UpdateRoleUseCase = require('../application/use-cases/UpdateRoleUseCase');
const DeleteRoleUseCase = require('../application/use-cases/DeleteRoleUseCase');
const AssignRoleToUsersUseCase = require('../application/use-cases/AssignRoleToUsersUseCase');
const RolesController = require('./RolesController');

/**
 * Factory for creating RolesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createRolesController() {
  // Infrastructure layer
  const roleRepository = new RolePrismaRepository();

  // Application layer (Use Cases)
  const useCases = {
    list: new ListRolesUseCase(roleRepository),
    getById: new GetRoleByIdUseCase(roleRepository),
    create: new CreateRoleUseCase(roleRepository),
    update: new UpdateRoleUseCase(roleRepository),
    delete: new DeleteRoleUseCase(roleRepository),
    assignToUsers: new AssignRoleToUsersUseCase(roleRepository)
  };

  // Presentation layer
  const controller = new RolesController(useCases);

  return controller;
}

module.exports = { createRolesController };

