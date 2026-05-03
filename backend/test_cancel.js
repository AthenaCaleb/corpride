const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');
const { updateRideStatus } = require('./controllers/driverController');

async function testCancel() {
  await mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp');
  
  const driver = await User.findOne({ name: 'Driverone' });
  const ride = await Ride.findOne({ driver: driver._id });
  
  if (!ride) {
    console.log('No ride found for Driverone. Creating one...');
    const newRide = await Ride.create({
      driver: driver._id,
      employees: [driver._id], // dummy
      pickupPoints: [{ address: 'Test', coordinates: [0, 0] }],
      shiftTime: '09:00',
      status: 'scheduled'
    });
    console.log('Created ride:', newRide._id);
    
    // Test cancel
    try {
      const req = { body: { rideId: newRide._id, status: 'cancelled' }, user: driver };
      const res = { 
        status: (code) => ({ json: (data) => console.log('Response:', code, data) })
      };
      await updateRideStatus(req, res);
    } catch (err) {
      console.error('Error:', err);
    }
  } else {
    console.log('Testing cancel on existing ride:', ride._id);
    try {
      const req = { body: { rideId: ride._id, status: 'cancelled' }, user: driver };
      const res = { 
        status: (code) => ({ json: (data) => console.log('Response:', code, data) })
      };
      await updateRideStatus(req, res);
    } catch (err) {
      console.error('Error:', err);
    }
  }
  process.exit(0);
}

testCancel();
