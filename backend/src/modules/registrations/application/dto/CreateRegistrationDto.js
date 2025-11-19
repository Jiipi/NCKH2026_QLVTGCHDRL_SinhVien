/**
 * CreateRegistrationDto
 * Data Transfer Object for creating a registration
 */
class CreateRegistrationDto {
  constructor(data) {
    this.userId = data.userId;
    this.activityId = data.activityId;
    this.note = data.note;
  }

  static fromRequest(body, user) {
    return new CreateRegistrationDto({
      userId: body.userId || user.id,
      activityId: body.activityId,
      note: body.note
    });
  }
}

module.exports = CreateRegistrationDto;

