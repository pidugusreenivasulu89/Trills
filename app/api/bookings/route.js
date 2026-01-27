import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';
import Booking from '@/models/Booking';

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { venueId, guests, bookingTime, bookingDate, action, amountPaid, currency } = body;

        const venue = await Venue.findById(venueId);
        if (!venue) return NextResponse.json({ error: 'Venue not found' }, { status: 404 });

        // Handle Admin manual seat updates
        if (action === 'setRemaining') {
            const booked = venue.capacity - guests;
            venue.bookedCount = Math.max(0, booked);
            await venue.save();
            return NextResponse.json({ message: 'Availability updated' });
        }

        // Validate booking time against venue hours
        if (bookingTime) {
            const time = bookingTime.replace(':', '');
            const open = venue.openTime?.replace(':', '') || '0000';
            const close = venue.closeTime?.replace(':', '') || '2359';

            if (time < open || time > close) {
                return NextResponse.json({
                    error: `Booking time must be between ${venue.openTime} and ${venue.closeTime}`
                }, { status: 400 });
            }
        }

        const remaining = venue.capacity - venue.bookedCount;
        if (remaining < Number(guests)) {
            return NextResponse.json({ error: 'Venue is full!', available: remaining }, { status: 400 });
        }

        // Create Booking Record
        await Booking.create({
            venueId,
            guests: Number(guests),
            tableNumber: body.tableNumber,
            amountPaid: amountPaid || 99,
            currency: currency || 'INR',
            paymentStatus: 'paid',
            bookingDate: bookingDate || new Date().toISOString().split('T')[0],
            bookingTime
        });

        // Update Venue Capacity
        venue.bookedCount += Number(guests);
        await venue.save();

        return NextResponse.json({ message: 'Booking successful' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Booking failed: ' + error.message }, { status: 500 });
    }
}
