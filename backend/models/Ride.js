const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pickupPoints: [{
    address: { type: String },
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  }],
  shiftTime: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  startTime: Date,
  endTime: Date
}, { timestamps: true });

RideSchema.index({ 'pickupPoints.coordinates': '2dsphere' });

module.exports = mongoose.model('Ride', RideSchema);