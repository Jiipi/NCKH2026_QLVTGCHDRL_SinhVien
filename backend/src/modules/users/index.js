/**
 * Users Module - Export
 * Clean architecture pattern
 */

const UsersController = require('./users.controller');
const usersRoutes = require('./users.routes');
const usersService = require('./users.service');
const usersRepo = require('./users.repo');
const validators = require('./users.validators');

module.exports = {
  controller: UsersController,
  routes: usersRoutes,
  service: usersService,
  repo: usersRepo,
  validators,
};





