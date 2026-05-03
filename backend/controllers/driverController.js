const Ride = require('../models/Ride');

// @desc    Get assigned rides for the driver
// @route   GET /api/driver/rides
// @access  Private (Driver)
const getAssignedRides = async (req, res) => {
  try {
    const rides = await Ride.find({ 
      driver: req.user._id 
    }).populate('employees', 'name email address phone').sort({ createdAt: -1 });

    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching assigned rides' });
  }
};

// @desc    Update ride status
// @route   POST /api/driver/update-status
// @access  Private (Driver)
const updateRideStatus = async (req, res) => {
  try {
    const { rideId, status } = req.body;

    const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this ride' });
    }

    ride.status = status;
    
    if (status === 'ongoing') {
      ride.startTime = Date.now();
    } else if (status === 'completed') {
      ride.endTime = Date.now();
    } else if (status === 'cancelled') {
      // If driver cancels, set employee requests back to 'pending' so they can be matched again
      const RideRequest = require('../models/RideRequest');
      await RideRequest.updateMany(
        { employee: { $in: ride.employees }, status: 'matched' },
        { $set: { status: 'pending' } }
      );
    }

    await ride.save();

    res.status(200).json(ride);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating ride status' });
  }
};

module.exports = {
  getAssignedRides,
  updateRideStatus
};
