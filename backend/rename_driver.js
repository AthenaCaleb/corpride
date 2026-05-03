const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  const res = await User.updateOne({ name: 'Driverone' }, { $set: { name: 'Driver 2' } });
  console.log('Renamed Driverone to Driver 2. Modified:', res.modifiedCount);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
