const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://athenacaleb05_db_user:cybersecurity@ridingapp.nqp2eoi.mongodb.net/?appName=RidingApp')
.then(async () => {
  try {
    const db = mongoose.connection.db;
    await db.collection('rides').dropIndex('rideId_1');
    console.log('Index rideId_1 dropped successfully!');
  } catch (err) {
    console.error('Error dropping index:', err.message);
  }
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
