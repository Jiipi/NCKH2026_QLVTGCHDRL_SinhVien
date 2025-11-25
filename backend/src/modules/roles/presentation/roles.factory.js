const rolesRepository = require('../data/repositories/roles.repository');
const ListRolesUseCase = require('../business/services/ListRolesUseCase');
const GetRoleByIdUseCase = require('../business/services/GetRoleByIdUseCase');
const CreateRoleUseCase = require('../business/services/CreateRoleUseCase');
const UpdateRoleUseCase = require('../business/services/UpdateRoleUseCase');
const DeleteRoleUseCase = require('../business/services/DeleteRoleUseCase');
const AssignRoleToUsersUseCase = require('../business/services/AssignRoleToUsersUseCase');
const RolesController = require('./controllers/RolesController');

/**
 * Factory for creating RolesController with all dependencies
 * Implements Dependency Injection pattern
 */
function createRolesController() {
  // Data layer
  const repo = rolesRepository;

  // Business layer (Use Cases)
  const useCases = {
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

module.exports = { createRolesController };

