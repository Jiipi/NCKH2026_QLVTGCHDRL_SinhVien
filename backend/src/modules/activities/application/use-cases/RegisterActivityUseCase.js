const { NotFoundError, ValidationError, ForbiddenError } = require('../../../../core/errors/AppError');
const { prisma } = require('../../../../infrastructure/prisma/client');
const registrationsService = require('../../../registrations/registrations.service');

/**
 * RegisterActivityUseCase
 * Use case for registering for an activity
 * Follows Single Responsibility Principle (SRP)
 */
class RegisterActivityUseCase {
  async execute(activityId, user) {
    // Use existing registrations service logic
    const result = await registrationsService.register(activityId, user);
    return result;
  }
}

module.exports = RegisterActivityUseCase;

