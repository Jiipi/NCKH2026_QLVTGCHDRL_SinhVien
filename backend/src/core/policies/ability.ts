/**
 * RBAC Ability Management
 * Centralized authorization logic using CASL-like pattern
 */

import { Request, Response, NextFunction } from 'express';
import { logError } from '../logger';

/**
 * Role definitions
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  BAN_CAN_SU: 'BAN_CAN_SU',
  GIANG_VIEN: 'GIANG_VIEN',
  SINH_VIEN: 'SINH_VIEN',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

/**
 * Action definitions
 */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  MANAGE: 'manage', // Full control
} as const;

export type ActionType = typeof ACTIONS[keyof typeof ACTIONS];

/**
 * Resource definitions
 */
export const RESOURCES = {
  ACTIVITY: 'activity',
  USER: 'user',
  CLASS: 'class',
  SEMESTER: 'semester',
  REGISTRATION: 'registration',
  NOTIFICATION: 'notification',
  POINT: 'point',
  REPORT: 'report',
  PROFILE: 'profile',
} as const;

export type ResourceType = typeof RESOURCES[keyof typeof RESOURCES] | 'all';

/**
 * User context interface
 */
export interface IUserContext {
  id?: string | number;
  vai_tro?: RoleType;
  lop_id?: string | number;
  [key: string]: unknown;
}

/**
 * Rule condition interface
 */
export interface IRuleCondition {
  [key: string]: unknown;
}

/**
 * Ability rule interface
 */
export interface IAbilityRule {
  action: ActionType | ActionType[];
  resource: ResourceType;
  conditions?: IRuleCondition;
}

/**
 * Ability object interface
 */
export interface IAbility {
  rules: IAbilityRule[];
  role: RoleType;
  userId?: string | number;
}

/**
 * Extended Express Request with user and ability
 */
export interface IAuthRequest extends Request {
  user?: IUserContext;
  ability?: IAbility;
}

/**
 * Define abilities for each role
 * @param role
 * @param user - User context
 * @returns Ability rules
 */
export function defineAbilitiesFor(role: RoleType, user: IUserContext = {}): IAbility {
  const rules: IAbilityRule[] = [];

  switch (role) {
    case ROLES.ADMIN:
    case ROLES.BAN_CAN_SU:
      // Admin can manage everything
      rules.push({
        action: ACTIONS.MANAGE,
        resource: 'all',
      });
      break;

    case ROLES.GIANG_VIEN:
      // Teachers can manage their classes
      rules.push(
        {
          action: [ACTIONS.READ, ACTIONS.UPDATE],
          resource: RESOURCES.CLASS,
          conditions: { giao_vien_chu_nhiem_id: user.id },
        },
        {
          action: [ACTIONS.READ],
          resource: RESOURCES.CLASS,
        },
        // Teachers can approve/reject activities
        {
          action: [ACTIONS.READ, ACTIONS.APPROVE, ACTIONS.REJECT],
          resource: RESOURCES.ACTIVITY,
        },
        // Teachers can create activities for their classes
        {
          action: [ACTIONS.CREATE],
          resource: RESOURCES.ACTIVITY,
        },
        // Teachers can view students
        {
          action: [ACTIONS.READ],
          resource: RESOURCES.USER,
        },
        // Teachers can view/manage registrations
        {
          action: [ACTIONS.READ, ACTIONS.APPROVE],
          resource: RESOURCES.REGISTRATION,
        },
        // Teachers can view points
        {
          action: [ACTIONS.READ],
          resource: RESOURCES.POINT,
        },
        // Teachers can generate reports
        {
          action: [ACTIONS.READ, ACTIONS.CREATE],
          resource: RESOURCES.REPORT,
        },
        // Teachers can manage their profile
        {
          action: [ACTIONS.READ, ACTIONS.UPDATE],
          resource: RESOURCES.PROFILE,
          conditions: { id: user.id },
        }
      );
      break;

    case ROLES.SINH_VIEN:
      // Students can view approved activities
      rules.push(
        {
          action: [ACTIONS.READ],
          resource: RESOURCES.ACTIVITY,
          conditions: { trang_thai: 'APPROVED' },
        },
        // Students can create activities (pending approval)
        {
          action: [ACTIONS.CREATE],
          resource: RESOURCES.ACTIVITY,
        },
        // Students can update their own pending activities
        {
          action: [ACTIONS.UPDATE, ACTIONS.DELETE],
          resource: RESOURCES.ACTIVITY,
          conditions: {
            nguoi_tao_id: user.id,
            trang_thai: 'PENDING',
          },
        },
        // Students can register for activities
        {
          action: [ACTIONS.CREATE],
          resource: RESOURCES.REGISTRATION,
        },
        // Students can view/cancel their own registrations
        {
          action: [ACTIONS.READ, ACTIONS.DELETE],
          resource: RESOURCES.REGISTRATION,
          conditions: { sinh_vien_id: user.id },
        },
        // Students can view their own points
        {
          action: [ACTIONS.READ],
          resource: RESOURCES.POINT,
          conditions: { sinh_vien_id: user.id },
        },
        // Students can view their class
        {
          action: [ACTIONS.READ],
          resource: RESOURCES.CLASS,
          conditions: { id: user.lop_id },
        },
        // Students can manage their profile
        {
          action: [ACTIONS.READ, ACTIONS.UPDATE],
          resource: RESOURCES.PROFILE,
          conditions: { id: user.id },
        },
        // Students can view notifications
        {
          action: [ACTIONS.READ],
          resource: RESOURCES.NOTIFICATION,
        }
      );
      break;

    default:
      logError(`Unknown role: ${role}`);
      break;
  }

  return { rules, role, userId: user.id };
}

/**
 * Check if user can perform action on resource
 * @param ability - Ability object from defineAbilitiesFor
 * @param action
 * @param resource
 * @param subject - The actual resource instance (optional)
 * @returns boolean
 */
export function can(
  ability: IAbility,
  action: ActionType,
  resource: ResourceType,
  subject: Record<string, unknown> | null = null
): boolean {
  const { rules } = ability;

  for (const rule of rules) {
    // Check for 'manage all' rule
    if (rule.action === ACTIONS.MANAGE && rule.resource === 'all') {
      return true;
    }

    // Check if action matches
    const actionMatches =
      rule.action === action ||
      (Array.isArray(rule.action) && rule.action.includes(action)) ||
      rule.action === ACTIONS.MANAGE;

    // Check if resource matches
    const resourceMatches = rule.resource === resource || rule.resource === 'all';

    if (actionMatches && resourceMatches) {
      // If no conditions, allow
      if (!rule.conditions) {
        return true;
      }

      // If conditions exist and subject is provided, check conditions
      if (subject && rule.conditions) {
        const conditionsMet = Object.entries(rule.conditions).every(
          ([key, value]) => subject[key] === value
        );
        if (conditionsMet) {
          return true;
        }
      }

      // If conditions exist but subject not provided, assume allowed
      // (condition check will happen at service/controller level)
      if (!subject && rule.conditions) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Middleware to check permissions
 * Usage: requirePermission('read', 'activity')
 */
export function requirePermission(action: ActionType, resource: ResourceType) {
  return (req: IAuthRequest, res: Response, next: NextFunction): Response | void => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const ability = defineAbilitiesFor(req.user.vai_tro as RoleType, req.user);

    // For subject-level checks, extract from req.params or req.body
    const subject = req.params.id
      ? { id: parseInt(req.params.id), ...req.body }
      : req.body;

    if (!can(ability, action, resource, subject)) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to ${action} ${resource}`,
      });
    }

    // Attach ability to request for further checks
    req.ability = ability;
    next();
  };
}

// CommonJS compatibility
module.exports = {
  ROLES,
  ACTIONS,
  RESOURCES,
  defineAbilitiesFor,
  can,
  requirePermission,
};
