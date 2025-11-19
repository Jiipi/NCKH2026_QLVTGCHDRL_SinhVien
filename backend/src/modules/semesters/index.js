/**
 * Semesters Module
 * Exports all semesters module components
 */

const SemestersService = require('./semesters.service');
const routes = require('./semesters.routes');
const validators = require('./semesters.validators');

module.exports = {
  SemestersService,
  routes,
  validators,
};
