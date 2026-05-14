const RideRequest = require('../models/RideRequest');
const Ride = require('../models/Ride');
const User = require('../models/User');

const MAX_PASSENGERS = 4;

const matchRide = async (rideRequest) => {
  try {
    // 1. Look for an existing scheduled ride for the same shift, company and destination with space
    let existingRide = await Ride.findOne({
      shiftTime: rideRequest.shiftTime,
      company: rideRequest.company,
      destinationAddress: rideRequest.destinationAddress,
      status: 'scheduled',
      'pickupPoints.coordinates': {
        $near: {
          $geometry: rideRequest.pickupLocation,
          $maxDistance: 5000 // 5 km
        }
      }
    });

    // 2. Check if the ride found has available space
    if (existingRide && existingRide.employees.length < MAX_PASSENGERS) {
      // Add employee to this ride
      existingRide.employees.push(rideRequest.employee);
      existingRide.pickupPoints.push(rideRequest.pickupLocation);
      await existingRide.save();

      rideRequest.status = 'matched';
      await rideRequest.save();

      return existingRide;
    }

    // 2. No existing ride with space, try to create a new one
    // Find an available driver who is not currently busy at that shiftTime AND belongs to the same company
    const busyDriversForShift = await Ride.find({
      shiftTime: rideRequest.shiftTime,
      status: { $in: ['scheduled', 'ongoing'] }
    }).select('driver');
    
    const busyDriverIds = busyDriversForShift.map(r => r.driver).filter(id => id != null);

    const availableDriver = await User.findOne({
      role: 'driver',
      company: rideRequest.company,
      _id: { $nin: busyDriverIds }
    });

    if (availableDriver) {
      const newRide = await Ride.create({
        driver: availableDriver._id,
        employees: [rideRequest.employee],
        pickupPoints: [rideRequest.pickupLocation],
        shiftTime: rideRequest.shiftTime,
        destinationAddress: rideRequest.destinationAddress,
        company: rideRequest.company,
        status: 'scheduled'
      });

      rideRequest.status = 'matched';
      await rideRequest.save();

      return newRide;
    }

    // 3. No driver available, stays pending
    return null;
  } catch (error) {
    console.error('Matchmaking error:', error);
    throw error;
  }
};

module.exports = { matchRide };
