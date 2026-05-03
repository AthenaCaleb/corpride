const mongoose = require('mongoose');
const { matchRide } = require('./utils/matchMaker');
const RideRequest = require('./models/RideRequest');
const Ride = require('./models/Ride');
const User = require('./models/User');

const MONGO_URI = 'mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp';

async function runTest() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');

  // Ensure index is active
  await Ride.syncIndexes();
  console.log('Indexes synced');

  // Clear previous test data
  await Ride.deleteMany({});
  await RideRequest.deleteMany({});
  
  // Find or create a driver
  let driver = await User.findOne({ role: 'driver' });
  if (!driver) {
    driver = await User.create({
      name: 'Test Driver',
      email: 'testdriver@test.com',
      password: 'password',
      role: 'driver'
    });
  }

  // Find or create employee
  let employee = await User.findOne({ role: 'employee' });

  // 1. Employee A requests from Tidel Park (Chennai)
  // [longitude, latitude]
  const posA = [80.245, 12.989]; 
  const reqA = await RideRequest.create({
    employee: employee._id,
    shiftTime: '09:00',
    pickupLocation: { address: 'Tidel Park', type: 'Point', coordinates: posA }
  });
  const rideA = await matchRide(reqA);
  console.log('Ride A assigned to:', rideA.driver.toString());

  // 2. Employee B requests from Adyar (Chennai) - ~3km away
  const posB = [80.257, 13.006];
  const reqB = await RideRequest.create({
    employee: employee._id,
    shiftTime: '09:00',
    pickupLocation: { address: 'Adyar', type: 'Point', coordinates: posB }
  });
  const rideB = await matchRide(reqB);
  console.log('Ride B matches Ride A?', rideB._id.toString() === rideA._id.toString());

  // 3. Employee C requests from Marina Beach (Chennai) - ~10km away
  const posC = [80.282, 13.050];
  const reqC = await RideRequest.create({
    employee: employee._id,
    shiftTime: '09:00',
    pickupLocation: { address: 'Marina Beach', type: 'Point', coordinates: posC }
  });
  const rideC = await matchRide(reqC);
  
  if (rideC) {
    console.log('Ride C matches Ride A?', rideC._id.toString() === rideA._id.toString());
    console.log('Ride C matches Ride B?', rideC._id.toString() === rideB._id.toString());
  } else {
    console.log('Ride C pending (No other driver available or out of range)');
  }

  process.exit(0);
}

runTest().catch(err => {
  console.error(err);
  process.exit(1);
});
