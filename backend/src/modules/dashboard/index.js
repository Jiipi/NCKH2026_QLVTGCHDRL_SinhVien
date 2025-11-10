/**
 * Dashboard Module
 * Provides student and admin dashboard data with activity statistics
 */

const routes = require('./dashboard.routes');
const service = require('./dashboard.service');
const repo = require('./dashboard.repo');

module.exports = {
  routes,
  service,
  repo
};
