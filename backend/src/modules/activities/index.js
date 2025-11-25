/**
 * Activities Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - validators
 * - data/ - repositories
 */

const routes = require('./presentation/routes/activities.routes');

module.exports = {
  routes,
};
