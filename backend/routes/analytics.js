const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getSummary, getAdminStats } = require('../controllers/analyticsController');

router.get('/summary', protect, adminOnly, getSummary);
router.get('/admins',  protect, adminOnly, getAdminStats);

module.exports = router;
