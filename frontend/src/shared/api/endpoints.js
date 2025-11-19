/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions to avoid hardcoding
 */

const API_ENDPOINTS = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
    changePassword: '/auth/change-password',
  },

  // User endpoints
  users: {
    list: '/core/admin/users',
    detail: (id) => `/core/admin/users/${id}`,
    create: '/core/admin/users',
    update: (id) => `/core/admin/users/${id}`,
    delete: (id) => `/core/admin/users/${id}`,
    points: (id) => `/core/admin/reports/users/${id}/points`,
  },

  // Activities endpoints
  activities: {
    list: '/core/activities',
    detail: (id) => `/core/activities/${id}`,
    create: '/core/activities',
    update: (id) => `/core/activities/${id}`,
    delete: (id) => `/core/activities/${id}`,
    approve: (id) => `/core/activities/${id}/approve`,
    reject: (id) => `/core/activities/${id}/reject`,
  },

  // Activity types endpoints
  activityTypes: {
    list: '/core/activity-types',
    detail: (id) => `/core/activity-types/${id}`,
    create: '/core/activity-types',
    update: (id) => `/core/activity-types/${id}`,
    delete: (id) => `/core/activity-types/${id}`,
  },

  // Registrations endpoints
  registrations: {
    list: '/core/admin/registrations',
    detail: (id) => `/core/admin/registrations/${id}`,
    approve: (id) => `/core/admin/registrations/${id}/approve`,
    reject: (id) => `/core/admin/registrations/${id}/reject`,
    bulk: '/core/admin/registrations/bulk',
  },

  // Roles endpoints
  roles: {
    list: '/core/roles',
    detail: (id) => `/core/roles/${id}`,
    create: '/core/roles',
    update: (id) => `/core/roles/${id}`,
    delete: (id) => `/core/roles/${id}`,
  },

  // Dashboard endpoints
  dashboard: {
    student: '/core/dashboard/student',
    teacher: '/core/dashboard/teacher',
    monitor: '/core/dashboard/monitor',
    admin: '/core/dashboard/admin',
  },

  // Reports endpoints
  reports: {
    overview: '/core/admin/reports/overview',
    classes: '/core/admin/reports/classes',
    attendance: '/core/admin/reports/attendance',
    export: {
      activities: '/core/admin/reports/export/activities',
      registrations: '/core/admin/reports/export/registrations',
    },
  },

  // Broadcast endpoints
  broadcast: {
    send: '/core/broadcast',
    stats: '/core/broadcast/stats',
    history: '/core/broadcast/history',
  },

  // Semester endpoints
  semesters: {
    list: '/semesters',
    active: '/semesters/active',
    activate: (id) => `/semesters/${id}/activate`,
    lock: (id) => `/semesters/${id}/lock`,
    unlock: (id) => `/semesters/${id}/unlock`,
  },

  // Profile endpoints
  profile: {
    get: '/profile',
    update: '/profile',
    avatar: '/profile/avatar',
    points: '/profile/points',
  },

  // QR Attendance endpoints
  qr: {
    generate: (activityId) => `/qr/${activityId}/generate`,
    scan: '/qr/scan',
    attendance: (activityId) => `/qr/${activityId}/attendance`,
  },

  // Classes endpoints
  classes: {
    list: '/semesters/classes',
    detail: (id) => `/semesters/classes/${id}`,
    students: (id) => `/semesters/classes/${id}/students`,
    activities: (id) => `/semesters/classes/${id}/activities`,
  },

  // Notifications endpoints
  notifications: {
    list: '/notifications',
    detail: (id) => `/notifications/${id}`,
    markRead: (id) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
};

export default API_ENDPOINTS;
