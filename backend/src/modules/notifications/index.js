/**
 * Notifications Module
 * Exports notifications repository, service, and routes
 */

const repo = require('./notifications.repo');
const service = require('./notifications.service');
const routes = require('./notifications.routes');

module.exports = {
  repo,
  service,
  routes
};





