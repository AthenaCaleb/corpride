const mongoose = require('mongoose');
const Ride = require('./models/Ride');
const User = require('./models/User');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  const driverOne = await User.findOne({ name: 'Driverone' });
  if (driverOne) {
    const res = await Ride.updateMany({}, { $set: { driver: driverOne._id } });
    console.log('Reassigned rides to Driverone. Modified count:', res.modifiedCount);
  } else {
    console.log('Driverone not found.');
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
