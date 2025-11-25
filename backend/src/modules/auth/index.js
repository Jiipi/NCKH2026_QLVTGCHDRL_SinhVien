/**
 * Auth Module
 * Exports all auth module components
 * 3 Tiers Architecture:
 * - presentation/ - controllers, routes
 * - business/ - validators
 * - data/ - repositories
 */

const routes = require('./presentation/routes/auth.routes');

module.exports = {
  routes,
};
