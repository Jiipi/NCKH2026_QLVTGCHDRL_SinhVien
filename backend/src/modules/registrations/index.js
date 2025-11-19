/**
 * Registrations Module - Export
 */

const registrationsRoutes = require('./registrations.routes');
const registrationsService = require('./registrations.service');
const registrationsRepo = require('./registrations.repo');

module.exports = {
  routes: registrationsRoutes,
  service: registrationsService,
  repo: registrationsRepo
};