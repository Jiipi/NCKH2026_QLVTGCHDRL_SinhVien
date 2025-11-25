/**
 * Notifications Module Index
 * Export all components following 3 tiers architecture
 * Structure:
 * - presentation/ - controllers, routes
 * - business/ - use cases, DTOs
 * - data/ - repositories
 */

const routes = require('./presentation/routes/notifications.routes');

module.exports = {
  routes,
};