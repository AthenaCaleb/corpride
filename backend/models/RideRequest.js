const mongoose = require('mongoose');

const RideRequestSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pickupLocation: {
    address: { type: String },
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  shiftTime: { type: String, required: true },
  status: { type: String, enum: ['pending', 'matched', 'cancelled'], default: 'pending' }
}, { timestamps: true });

RideRequestSchema.index({ 'pickupLocation': '2dsphere' });
RideRequestSchema.index({ shiftTime: 1, status: 1 });

module.exports = mongoose.model('RideRequest', RideRequestSchema);