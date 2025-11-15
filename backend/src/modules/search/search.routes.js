const express = require('express');
const router = express.Router();
const SearchService = require('./search.service');
const { ApiResponse, sendResponse } = require('../../core/http/response/apiResponse');
const { auth } = require('../../core/http/middleware/authJwt');

/**
 * @route   GET /api/search
 * @desc    Global search across activities, students, classes, teachers
 * @access  Private (All authenticated users)
 */
router.get('/', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const user = req.user;

    const results = await SearchService.globalSearch(q, user);
    
    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi tìm kiếm',
      error: error.message
    });
  }
});

module.exports = router;






