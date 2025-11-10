/**
 * Users Module - Export
 */

const usersRoutes = require('./users.routes');
const usersService = require('./users.service');
const usersRepo = require('./users.repo');

module.exports = {
  routes: usersRoutes,
  service: usersService,
  repo: usersRepo
};
