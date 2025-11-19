const { prisma } = require('../../../../infrastructure/prisma/client');
const { ForbiddenError } = require('../../../../core/errors/AppError');

async function checkAccess(registration, user) {
  if (user.role === 'ADMIN') return true;
  if (registration.userId === user.id) return true;

  if (user.role === 'GIANG_VIÊN' && registration.activity) {
    if (registration.activity.createdBy === user.id || registration.activity.nguoi_tao_id === user.id) {
      return true;
    }
  }

  if (user.role === 'LOP_TRUONG') {
    const regUser = await prisma.user.findUnique({
      where: { id: registration.userId }
    });
    if (regUser && regUser.class === user.class) {
      return true;
    }
  }

  throw new ForbiddenError('Bạn không có quyền xem registration này');
}

async function canApproveRegistration(registration, user) {
  if (user.role === 'ADMIN') return true;

  if (user.role === 'GIANG_VIÊN' && registration.activity) {
    return registration.activity.createdBy === user.id || registration.activity.nguoi_tao_id === user.id;
  }

  if (user.role === 'LOP_TRUONG') {
    const regUser = await prisma.user.findUnique({
      where: { id: registration.userId }
    });
    return regUser && regUser.class === user.class;
  }

  return false;
}

async function canManageActivity(activity, user) {
  if (user.role === 'ADMIN') return true;
  if (user.role === 'GIANG_VIÊN' && (activity.createdBy === user.id || activity.nguoi_tao_id === user.id)) {
    return true;
  }
  return false;
}

module.exports = {
  checkAccess,
  canApproveRegistration,
  canManageActivity
};

