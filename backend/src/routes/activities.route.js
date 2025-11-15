/**
 * Activities Legacy Route
 * Alias for backward compatibility
 * Redirects to /core/activities
 */

const activitiesV2 = require('../modules/activities');

// Export the same routes - frontend will call /api/activities which maps here
module.exports = activitiesV2.routes;
