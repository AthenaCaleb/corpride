const mongoose = require('mongoose');
const Ride = require('./models/Ride');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  const rides = await Ride.find();
  console.log('Rides:', rides);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
