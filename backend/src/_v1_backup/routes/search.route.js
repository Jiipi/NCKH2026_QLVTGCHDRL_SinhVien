const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/search.controller');
const { auth: authenticate } = require('../middlewares/auth');

/**
 * @route GET /api/search?q=keyword
 * @desc Tìm kiếm toàn cục dựa trên role
 * @access Private (requires authentication)
 */
router.get('/', authenticate, globalSearch);

module.exports = router;
