/**
 * Users Module - TypeScript Index
 */

export type {
  User,
  UserWithRelations,
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  UserFilterOptions,
  UserQueryOptions,
  PaginatedUsersResult,
  IUsersRepository,
  IGetUsersUseCase,
  IGetUserByIdUseCase,
  ICreateUserUseCase,
  IUpdateUserUseCase,
  IDeleteUserUseCase,
  IUserValidators,
  IUsersController
} from './users.types';

const routes = require('./presentation/routes/users.routes');
const validators = require('./business/validators/users.validators');
export { routes, validators };
module.exports = { routes, validators };
