/**
 * Activities Business Services - Barrel Export
 * Export tất cả Use Cases để dễ dàng import
 */

const ApproveActivityUseCase = require('./ApproveActivityUseCase');
const CancelActivityRegistrationUseCase = require('./CancelActivityRegistrationUseCase');
const CreateActivityUseCase = require('./CreateActivityUseCase');
const DeleteActivityUseCase = require('./DeleteActivityUseCase');
const GetActivitiesUseCase = require('./GetActivitiesUseCase');
const GetActivityByIdUseCase = require('./GetActivityByIdUseCase');
const GetActivityDetailsUseCase = require('./GetActivityDetailsUseCase');
const GetActivityQRDataUseCase = require('./GetActivityQRDataUseCase');
const RegisterActivityUseCase = require('./RegisterActivityUseCase');
const RejectActivityUseCase = require('./RejectActivityUseCase');
const ScanAttendanceUseCase = require('./ScanAttendanceUseCase');
const UpdateActivityUseCase = require('./UpdateActivityUseCase');

module.exports = {
  // CRUD Use Cases
  CreateActivityUseCase,
  GetActivitiesUseCase,
  GetActivityByIdUseCase,
  GetActivityDetailsUseCase,
  UpdateActivityUseCase,
  DeleteActivityUseCase,
  
  // Approval Use Cases
  ApproveActivityUseCase,
  RejectActivityUseCase,
  
  // Registration Use Cases
  RegisterActivityUseCase,
  CancelActivityRegistrationUseCase,
  
  // Attendance Use Cases
  GetActivityQRDataUseCase,
  ScanAttendanceUseCase,
};
