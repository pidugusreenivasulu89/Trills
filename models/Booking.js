import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
    guests: { type: Number, required: true },
    tableNumber: Number,
    amountPaid: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'refunded'], default: 'paid' },
    status: { type: String, enum: ['confirmed', 'cancelled', 'completed'], default: 'confirmed' },
    cancellationReason: String,
    refundId: String,
    bookingDate: { type: String, required: true },
    bookingTime: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
