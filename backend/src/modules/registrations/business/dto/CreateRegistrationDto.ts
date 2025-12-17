/**
 * CreateRegistrationDto
 * Data Transfer Object for creating a registration
 */

import type { JwtPayload } from '../../../../core/http/middleware/authJwt';

export interface CreateRegistrationInput {
  userId?: string;
  activityId: string;
  note?: string;
}

export interface RequestBody {
  userId?: string;
  activityId?: string;
  note?: string;
}

export class CreateRegistrationDto {
  public userId: string;
  public activityId: string;
  public note?: string;

  constructor(data: CreateRegistrationInput) {
    this.userId = data.userId || '';
    this.activityId = data.activityId;
    this.note = data.note;
  }

  static fromRequest(body: RequestBody, user: JwtPayload): CreateRegistrationDto {
    // user.sub là JWT subject (user ID), fallback về user.id nếu không có
    const userId = body.userId || user.sub;
    
    return new CreateRegistrationDto({
      userId: userId,
      activityId: body.activityId || '',
      note: body.note
    });
  }
}

export default CreateRegistrationDto;
module.exports = CreateRegistrationDto;
