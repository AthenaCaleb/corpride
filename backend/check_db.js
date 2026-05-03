const mongoose = require('mongoose');
const RideRequest = require('./models/RideRequest');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const reqs = await RideRequest.find().sort({ createdAt: -1 }).limit(1);
  console.log('Latest request:', reqs);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
