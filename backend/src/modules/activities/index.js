/**
 * Activities Module Index
 * Export all components following clean architecture pattern
 */

const activitiesRoutes = require('./activities.routes');
const activitiesService = require('./activities.service');
const activitiesRepo = require('./activities.repo');
const validators = require('./activities.validators');

module.exports = {
  routes: activitiesRoutes,
  service: activitiesService,
  repo: activitiesRepo,
  validators,
};
