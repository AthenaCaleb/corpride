const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const RideRequest = require('./models/RideRequest');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  await Ride.deleteMany({});
  await RideRequest.deleteMany({});
  console.log('All rides and requests wiped.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
