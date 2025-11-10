/**
 * Points Module
 * Exports points repository, service, and routes
 */

const repo = require('./points.repo');
const service = require('./points.service');
const routes = require('./points.routes');

module.exports = {
  repo,
  service,
  routes
};
