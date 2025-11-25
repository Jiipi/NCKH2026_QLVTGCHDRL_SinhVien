/**
 * Notification Types Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - DTOs, use cases
 * - data/ - repositories
 */

const routes = require('./presentation/routes/notification-types.routes');

module.exports = {
  routes,
};





