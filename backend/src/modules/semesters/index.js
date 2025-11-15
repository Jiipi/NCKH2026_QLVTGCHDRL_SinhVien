/**
 * Semesters Module
 * Exports all semesters module components
 */

const SemestersService = require('./semesters.service');
const SemestersController = require('./semesters.controller');
const routes = require('./semesters.routes');
const validators = require('./semesters.validators');

module.exports = {
  SemestersService,
  SemestersController,
  routes,
  validators,
};
