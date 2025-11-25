/**
 * Users Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - use cases, DTOs, validators
 * - data/ - repositories
 */

const routes = require('./presentation/routes/users.routes');
const validators = require('./business/validators/users.validators');

module.exports = {
  routes,
  validators,
};





