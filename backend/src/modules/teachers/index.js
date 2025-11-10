/**
 * Teachers Module - Export
 */

const teachersRoutes = require('./teachers.routes');
const teachersService = require('./teachers.service');
const teachersRepo = require('./teachers.repo');

module.exports = {
  routes: teachersRoutes,
  service: teachersService,
  repo: teachersRepo
};
