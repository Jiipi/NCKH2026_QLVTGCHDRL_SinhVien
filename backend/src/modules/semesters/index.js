/**
 * Semesters Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - use cases, validators
 * - data/ - repositories
 */

const routes = require('./presentation/routes/semesters.routes');
const validators = require('./business/validators/semesters.validators');

module.exports = {
  routes,
  validators,
};
