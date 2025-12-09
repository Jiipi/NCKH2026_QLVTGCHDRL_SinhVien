/**
 * API Endpoints Configuration
 * Centralized API endpoint definitions - 3-tier Data Layer
 */

// Base API paths
const API_BASE = {
    CORE: '/core',
    AUTH: '/auth',
    SEMESTERS: '/semesters',
} as const;

export const API_ENDPOINTS = {
    // Auth endpoints
    auth: {
        login: `${API_BASE.AUTH}/login`,
        logout: `${API_BASE.AUTH}/logout`,
        register: `${API_BASE.AUTH}/register`,
        forgotPassword: `${API_BASE.AUTH}/forgot-password`,
        resetPassword: `${API_BASE.AUTH}/reset-password`,
        me: `${API_BASE.AUTH}/me`,
        changePassword: `${API_BASE.AUTH}/change-password`,
    },

    // User endpoints
    users: {
        list: `${API_BASE.CORE}/admin/users`,
        detail: (id: string) => `${API_BASE.CORE}/admin/users/${id}`,
        create: `${API_BASE.CORE}/admin/users`,
        update: (id: string) => `${API_BASE.CORE}/admin/users/${id}`,
        delete: (id: string) => `${API_BASE.CORE}/admin/users/${id}`,
        points: (id: string) => `${API_BASE.CORE}/admin/reports/users/${id}/points`,
        profile: '/users/profile',
    },

    // Activities endpoints
    activities: {
        list: `${API_BASE.CORE}/activities`,
        detail: (id: string) => `${API_BASE.CORE}/activities/${id}`,
        create: `${API_BASE.CORE}/activities`,
        update: (id: string) => `${API_BASE.CORE}/activities/${id}`,
        delete: (id: string) => `${API_BASE.CORE}/activities/${id}`,
        approve: (id: string) => `${API_BASE.CORE}/activities/${id}/approve`,
        reject: (id: string) => `${API_BASE.CORE}/activities/${id}/reject`,
        register: (id: string) => `${API_BASE.CORE}/activities/${id}/register`,
        cancelRegistration: (id: string) => `${API_BASE.CORE}/activities/${id}/cancel-registration`,
        qrData: (id: string) => `${API_BASE.CORE}/activities/${id}/qr-data`,
        scanAttendance: `${API_BASE.CORE}/activities/scan-attendance`,
    },

    // Activity types endpoints
    activityTypes: {
        list: `${API_BASE.CORE}/activity-types`,
        detail: (id: string) => `${API_BASE.CORE}/activity-types/${id}`,
        create: `${API_BASE.CORE}/activity-types`,
        update: (id: string) => `${API_BASE.CORE}/activity-types/${id}`,
        delete: (id: string) => `${API_BASE.CORE}/activity-types/${id}`,
    },

    // Registrations endpoints
    registrations: {
        list: `${API_BASE.CORE}/admin/registrations`,
        detail: (id: string) => `${API_BASE.CORE}/admin/registrations/${id}`,
        approve: (id: string) => `${API_BASE.CORE}/admin/registrations/${id}/approve`,
        reject: (id: string) => `${API_BASE.CORE}/admin/registrations/${id}/reject`,
        bulk: `${API_BASE.CORE}/admin/registrations/bulk`,
        myRegistrations: `${API_BASE.CORE}/registrations/my`,
    },

    // Roles endpoints
    roles: {
        list: `${API_BASE.CORE}/roles`,
        detail: (id: string) => `${API_BASE.CORE}/roles/${id}`,
        create: `${API_BASE.CORE}/roles`,
        update: (id: string) => `${API_BASE.CORE}/roles/${id}`,
        delete: (id: string) => `${API_BASE.CORE}/roles/${id}`,
    },

    // Dashboard endpoints
    dashboard: {
        student: `${API_BASE.CORE}/dashboard/student`,
        teacher: `${API_BASE.CORE}/dashboard/teacher`,
        monitor: `${API_BASE.CORE}/dashboard/monitor`,
        admin: `${API_BASE.CORE}/dashboard/admin`,
    },

    // Reports endpoints
    reports: {
        overview: `${API_BASE.CORE}/admin/reports/overview`,
        classes: `${API_BASE.CORE}/admin/reports/classes`,
        attendance: `${API_BASE.CORE}/admin/reports/attendance`,
        export: {
            activities: `${API_BASE.CORE}/admin/reports/export/activities`,
            registrations: `${API_BASE.CORE}/admin/reports/export/registrations`,
        },
    },

    // Notifications endpoints
    notifications: {
        list: `${API_BASE.CORE}/notifications`,
        detail: (id: string) => `${API_BASE.CORE}/notifications/${id}`,
        markRead: (id: string) => `${API_BASE.CORE}/notifications/${id}/read`,
        markAllRead: `${API_BASE.CORE}/notifications/mark-all-read`,
        create: `${API_BASE.CORE}/notifications`,
        broadcast: `${API_BASE.CORE}/broadcast`,
    },

    // Semester endpoints
    semesters: {
        list: API_BASE.SEMESTERS,
        active: `${API_BASE.SEMESTERS}/active`,
        activate: (id: string) => `${API_BASE.SEMESTERS}/${id}/activate`,
        lock: (id: string) => `${API_BASE.SEMESTERS}/${id}/lock`,
        unlock: (id: string) => `${API_BASE.SEMESTERS}/${id}/unlock`,
    },

    // Classes endpoints
    classes: {
        list: `${API_BASE.SEMESTERS}/classes`,
        detail: (id: string) => `${API_BASE.SEMESTERS}/classes/${id}`,
        students: (id: string) => `${API_BASE.SEMESTERS}/classes/${id}/students`,
    },

    // Points/Scores endpoints
    points: {
        student: `${API_BASE.CORE}/points/student`,
        class: (classId: string) => `${API_BASE.CORE}/points/class/${classId}`,
        calculate: `${API_BASE.CORE}/points/calculate`,
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
        generate: (activityId: string) => `/qr/${activityId}/generate`,
        scan: '/qr/scan',
        attendance: (activityId: string) => `/qr/${activityId}/attendance`,
    },
} as const;

export default API_ENDPOINTS;
