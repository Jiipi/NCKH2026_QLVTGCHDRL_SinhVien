/**
 * AsyncHandler Middleware
 * Wraps async route handlers to automatically catch errors
 * Prevents unhandled promise rejections in Express routes
 */

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };

