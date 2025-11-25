/**
 * Classes Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - validators, DTOs, use cases
 * - data/ - repositories
 */

const routes = require('./presentation/routes/classes.routes');

module.exports = {
  routes,
};





