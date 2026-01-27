import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Booking from '@/models/Booking';
import Venue from '@/models/Venue';

export async function POST(req) {
    try {
        await dbConnect();
        const { bookingId, reason } = await req.json();

        const booking = await Booking.findById(bookingId);
        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

        if (booking.status === 'cancelled') {
            return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
        }

        // Logic for Refund eligibility
        // For demo: Full refund if booked more than 4 hours in the future
        const now = new Date();
        const bookingDateTime = new Date(`${booking.bookingDate}T${booking.bookingTime}`);
        const hoursUntilBooking = (bookingDateTime - now) / (1000 * 60 * 60);

        let refundProcessed = false;
        if (hoursUntilBooking > 4) {
            booking.paymentStatus = 'refunded';
            booking.refundId = 'REF-' + Math.random().toString(36).substring(7).toUpperCase();
            refundProcessed = true;
        }

        booking.status = 'cancelled';
        booking.cancellationReason = reason || 'User cancelled';
        await booking.save();

        // Release the seat back to the venue
        if (booking.venueId) {
            await Venue.findByIdAndUpdate(booking.venueId, { $inc: { bookedCount: -booking.guests } });
        }

        return NextResponse.json({
            success: true,
            message: refundProcessed
                ? 'Booking cancelled. Your ₹99 has been refunded.'
                : 'Booking cancelled. Note: Cancellation within 4 hours is non-refundable.',
            refundId: booking.refundId
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
