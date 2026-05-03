const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');
const RideRequest = require('./models/RideRequest');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  // Delete users from April (before May)
  const oldUsers = await User.deleteMany({ createdAt: { $lt: new Date('2026-05-01') } });
  console.log('Deleted old users:', oldUsers.deletedCount);

  // Delete rides from April
  const oldRides = await Ride.deleteMany({ createdAt: { $lt: new Date('2026-05-01') } });
  console.log('Deleted old rides:', oldRides.deletedCount);
  
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
