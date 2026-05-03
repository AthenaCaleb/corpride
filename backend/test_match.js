const mongoose = require('mongoose');
const { matchRide } = require('./utils/matchMaker');
const RideRequest = require('./models/RideRequest');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  const req = await RideRequest.findOne().sort({ createdAt: -1 });
  console.log('Testing matchRide on:', req._id);
  try {
    const res = await matchRide(req);
    console.log('Result:', res);
  } catch (err) {
    console.error('Match error:', err);
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
