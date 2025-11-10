/**
 * Activities Module Index
 * Export tất cả components của module
 */

const activitiesRoutes = require('./activities.routes');
const activitiesService = require('./activities.service');
const activitiesRepo = require('./activities.repo');

module.exports = {
  routes: activitiesRoutes,
  service: activitiesService,
  repo: activitiesRepo
};
