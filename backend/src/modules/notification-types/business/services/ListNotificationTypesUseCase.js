/**
 * ListNotificationTypesUseCase
 * Use case for listing notification types
 * Follows Single Responsibility Principle (SRP)
 */
class ListNotificationTypesUseCase {
  constructor(notificationTypeRepository) {
    this.notificationTypeRepository = notificationTypeRepository;
  }

  async execute() {
    return await this.notificationTypeRepository.findAll();
  }
}

module.exports = ListNotificationTypesUseCase;

