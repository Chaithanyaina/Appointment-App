const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true }, // Denormalized for easier admin view
  slotStartTime: { type: Date, required: true, unique: true }, // This enforces no double-booking at DB level
  slotEndTime: { type: Date, required: true },
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;