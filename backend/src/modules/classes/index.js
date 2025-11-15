/**
 * Classes Module - Export
 */

const classesRoutes = require('./classes.routes');
const classesService = require('./classes.service');
const classesRepo = require('./classes.repo');

module.exports = {
  routes: classesRoutes,
  service: classesService,
  repo: classesRepo
};





