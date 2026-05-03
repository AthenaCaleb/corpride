const mongoose = require('mongoose');
const User = require('./models/User');
const Ride = require('./models/Ride');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  const users = await User.find({}, 'name email role');
  console.log('Users:', users);
  
  const rides = await Ride.find().sort({createdAt: -1}).limit(2).populate('driver employees');
  console.log('\nRides:', JSON.stringify(rides, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
