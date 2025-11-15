/**
 * Policies Index
 * Export all RBAC policies and rules
 */

const ability = require('./ability');
const activityRules = require('./rules/activity.rules');
const userRules = require('./rules/user.rules');
const classRules = require('./rules/class.rules');
const semesterRules = require('./rules/semester.rules');

module.exports = {
  // Core ability management
  ...ability,

  // Resource-specific rules
  activityRules,
  userRules,
  classRules,
  semesterRules,
};




