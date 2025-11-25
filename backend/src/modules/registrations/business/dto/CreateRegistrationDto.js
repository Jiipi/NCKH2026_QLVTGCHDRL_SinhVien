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
    // user.sub là JWT subject (user ID), fallback về user.id nếu không có
    const userId = body.userId || user.sub || user.id;
    
    return new CreateRegistrationDto({
      userId: userId,
      activityId: body.activityId,
      note: body.note
    });
  }
}

module.exports = CreateRegistrationDto;

