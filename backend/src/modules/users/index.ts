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

import routes from './presentation/routes/users.routes';
import * as validators from './business/validators/users.validators';
export { routes, validators };
module.exports = { routes, validators };
