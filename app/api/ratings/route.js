import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';

export async function POST(request) {
    await dbConnect();
    try {
        const { venueId, rating } = await request.json();

        if (!venueId || !rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Invalid rating data' }, { status: 400 });
        }

        const venue = await Venue.findById(venueId);
        if (!venue) {
            return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
        }

        const totalScore = (venue.rating * venue.reviewCount) + Number(rating);
        const newCount = venue.reviewCount + 1;

        venue.rating = Number((totalScore / newCount).toFixed(1));
        venue.reviewCount = newCount;

        await venue.save();

        return NextResponse.json({ message: 'Rating submitted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
    }
}
