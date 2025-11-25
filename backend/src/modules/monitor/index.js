/**
 * Monitor Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - use cases
 * - data/ - repositories
 */

const routes = require('./presentation/routes/monitor.routes');

module.exports = {
  routes,
};





