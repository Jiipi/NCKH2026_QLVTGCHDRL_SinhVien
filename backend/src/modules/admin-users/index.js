/**
 * Admin Users Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - use cases, DTOs, validators
 * - data/ - repositories
 */

const routes = require('./presentation/routes/admin-users.routes');

module.exports = {
  routes,
};

