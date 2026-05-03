const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAllUsers, getAllRides, getAllRequests } = require('../controllers/adminController');

router.get('/users', protect, authorize('admin'), getAllUsers);
router.get('/rides', protect, authorize('admin'), getAllRides);
router.get('/requests', protect, authorize('admin'), getAllRequests);

module.exports = router;
