const RideRequest = require('../models/RideRequest');
const Ride = require('../models/Ride');
const { matchRide } = require('../utils/matchMaker');

// @desc    Request a ride
// @route   POST /api/rides/request
// @access  Private (Employee)
const requestRide = async (req, res) => {
  try {
    const { shiftTime, pickupAddress, coordinates } = req.body;
    console.log(`Booking request for ${req.user.name} at shift ${shiftTime}. Coordinates:`, coordinates);

    if (!shiftTime) {
      return res.status(400).json({ message: 'Shift time is required' });
    }

    // Default coordinates if not provided
    const userCoords = coordinates || req.user.location?.coordinates || [0, 0];
    const address = pickupAddress || req.user.address || 'Company Location';

    const newRequest = await RideRequest.create({
      employee: req.user._id,
      shiftTime,
      pickupLocation: {
        address,
        type: 'Point',
        coordinates: userCoords
      }
    });

    // Attempt to match the ride immediately
    const matchedRide = await matchRide(newRequest);

    res.status(201).json({
      request: newRequest,
      matchedRide: matchedRide ? matchedRide : null,
      message: matchedRide ? 'Ride matched' : 'Request pending'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error requesting ride' });
  }
};

// @desc    Get employee's ride history and active rides
// @route   GET /api/rides/my-rides
// @access  Private (Employee)
const getMyRides = async (req, res) => {
  try {
    const requests = await RideRequest.find({ employee: req.user._id }).sort({ createdAt: -1 });
    
    // Also find any actual Ride documents where this user is an employee
    const activeRides = await Ride.find({ 
      employees: req.user._id,
      status: { $in: ['scheduled', 'ongoing'] }
    }).populate('driver', 'name phone').populate('employees', 'name');

    res.status(200).json({ requests, activeRides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching rides' });
  }
};

// @desc    Cancel a ride request
// @route   POST /api/rides/cancel/:id
// @access  Private (Employee)
const cancelRideRequest = async (req, res) => {
  try {
    const rideRequest = await RideRequest.findById(req.params.id);

    if (!rideRequest) {
      return res.status(404).json({ message: 'Ride request not found' });
    }

    if (rideRequest.employee.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If already matched, remove from the actual Ride
    if (rideRequest.status === 'matched') {
      const activeRide = await Ride.findOne({ 
        employees: req.user._id,
        status: 'scheduled' 
      });

      if (activeRide) {
        activeRide.employees = activeRide.employees.filter(empId => empId.toString() !== req.user._id.toString());
        // Also remove the corresponding pickup point
        // (Assuming index matches, but for safety we filter by address/coordinates if possible)
        activeRide.pickupPoints = activeRide.pickupPoints.filter(p => p.address !== rideRequest.pickupLocation.address);
        
        if (activeRide.employees.length === 0) {
          activeRide.status = 'cancelled';
        }
        await activeRide.save();
      }
    }

    rideRequest.status = 'cancelled';
    await rideRequest.save();

    res.status(200).json({ message: 'Ride cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error cancelling ride' });
  }
};

module.exports = {
  requestRide,
  getMyRides,
  cancelRideRequest
};