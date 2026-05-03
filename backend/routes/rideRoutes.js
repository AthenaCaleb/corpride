const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { requestRide, getMyRides, cancelRideRequest } = require('../controllers/rideController');

router.post('/request', protect, authorize('employee'), requestRide);
router.get('/my-rides', protect, authorize('employee'), getMyRides);
router.post('/cancel/:id', protect, authorize('employee'), cancelRideRequest);

module.exports = router;