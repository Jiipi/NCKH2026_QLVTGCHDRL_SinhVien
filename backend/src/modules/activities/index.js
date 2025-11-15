/**
 * Activities Module Index
 * Export all components following clean architecture pattern
 */

const ActivitiesController = require('./activities.controller');
const activitiesRoutes = require('./activities.routes');
const activitiesService = require('./activities.service');
const activitiesRepo = require('./activities.repo');
const validators = require('./activities.validators');

module.exports = {
  controller: ActivitiesController,
  routes: activitiesRoutes,
  service: activitiesService,
  repo: activitiesRepo,
  validators,
};





