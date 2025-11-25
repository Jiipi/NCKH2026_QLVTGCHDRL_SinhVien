const express = require('express');
const router = express.Router();
const { createSearchController } = require('../search.factory');
const { auth } = require('../../../../core/http/middleware/authJwt');
const { asyncHandler } = require('../../../../core/http/middleware/asyncHandler');

const searchController = createSearchController();

/**
 * @route   GET /api/search
 * @desc    Global search across activities, students, classes, teachers
 * @access  Private (All authenticated users)
 */
router.get('/', auth, asyncHandler((req, res) => searchController.globalSearch(req, res)));

module.exports = router;
