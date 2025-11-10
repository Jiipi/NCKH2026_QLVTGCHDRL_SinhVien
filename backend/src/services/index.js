/**
 * Services Index
 * Centralized export for all service modules
 */

const AuthService = require('./auth.service');
const ReferenceDataService = require('./reference-data.service');
const StudentPointsService = require('./student-points.service');

module.exports = {
  AuthService,
  ReferenceDataService,
  StudentPointsService
};
