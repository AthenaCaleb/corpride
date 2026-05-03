const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const User = require('./models/User');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  const rides = await Ride.find().sort({createdAt: -1}).limit(2).populate('driver employees');
  console.log('\nRides:', JSON.stringify(rides, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
