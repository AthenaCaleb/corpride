const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getAssignedRides, updateRideStatus } = require('../controllers/driverController');

router.get('/rides', protect, authorize('driver'), getAssignedRides);
router.post('/update-status', protect, authorize('driver'), updateRideStatus);

module.exports = router;
