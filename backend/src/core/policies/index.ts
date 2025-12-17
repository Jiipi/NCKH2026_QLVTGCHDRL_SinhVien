/**
 * Policies Index
 * Export all RBAC policies and rules
 */

import {
  ROLES,
  ACTIONS,
  RESOURCES,
  defineAbilitiesFor,
  can,
  requirePermission,
  RoleType,
  ActionType,
  ResourceType,
  IUserContext,
  IAbilityRule,
  IAbility,
  IAuthRequest,
} from './ability';

import * as activityRules from './rules/activity.rules';
import * as userRules from './rules/user.rules';
import * as classRules from './rules/class.rules';
import * as semesterRules from './rules/semester.rules';

// Re-export types
export {
  RoleType,
  ActionType,
  ResourceType,
  IUserContext,
  IAbilityRule,
  IAbility,
  IAuthRequest,
};

// Re-export core ability management
export {
  ROLES,
  ACTIONS,
  RESOURCES,
  defineAbilitiesFor,
  can,
  requirePermission,
};

// Re-export resource-specific rules
export {
  activityRules,
  userRules,
  classRules,
  semesterRules,
};

// CommonJS compatibility
module.exports = {
  // Core ability management
  ROLES,
  ACTIONS,
  RESOURCES,
  defineAbilitiesFor,
  can,
  requirePermission,

  // Resource-specific rules
  activityRules,
  userRules,
  classRules,
  semesterRules,
};
