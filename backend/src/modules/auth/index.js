/**
 * Auth Module
 * Exports all auth module components
 */

const AuthService = require('./auth.service');
const AuthController = require('./auth.controller');
const routes = require('./auth.routes');
const validators = require('./auth.validators');

module.exports = {
  AuthService,
  AuthController,
  routes,
  validators,
};
