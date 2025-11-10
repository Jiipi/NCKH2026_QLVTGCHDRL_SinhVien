const rolesRoutes = require('./roles.routes');
const RolesService = require('./roles.service');

module.exports = {
  routes: rolesRoutes,
  service: RolesService
};
