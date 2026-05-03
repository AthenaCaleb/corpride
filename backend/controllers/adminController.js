const User = require('../models/User');
const Ride = require('../models/Ride');
const RideRequest = require('../models/RideRequest');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

// @desc    Get all rides
// @route   GET /api/admin/rides
// @access  Private (Admin)
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find({})
      .populate('driver', 'name')
      .populate('employees', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(rides);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching rides' });
  }
};

// @desc    Get all ride requests
// @route   GET /api/admin/requests
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
  try {
    const requests = await RideRequest.find({})
      .populate('employee', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching requests' });
  }
};

module.exports = {
  getAllUsers,
  getAllRides,
  getAllRequests
};
