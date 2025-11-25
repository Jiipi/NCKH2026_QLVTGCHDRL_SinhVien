const { buildScope } = require('../../../../app/scopes/scopeBuilder');
const usersRepo = require('../../data/repositories/users.repository');

/**
 * SearchUsersUseCase
 * Use case for searching users
 * Follows Single Responsibility Principle (SRP)
 */
class SearchUsersUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(searchTerm, user) {
    const users = await this.userRepository.search(searchTerm);

    // Apply scope filtering
    const scope = await buildScope('users', user);
    const filtered = users.filter(u => {
      if (scope.class) return u.class === scope.class;
      if (scope.id) return u.id === scope.id;
      return true;
    });

    // Remove passwords
    filtered.forEach(u => delete u.password);

    return filtered;
  }
}

module.exports = SearchUsersUseCase;

