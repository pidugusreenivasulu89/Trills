import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';
import { mockVenues } from '@/lib/mockData';

export async function GET() {
    try {
        await dbConnect();
        const venues = await Venue.find({});
        return NextResponse.json(venues);
    } catch (error) {
        console.warn('MongoDB connection failed, using mock data:', error.message);
        return NextResponse.json(mockVenues);
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const venue = await Venue.create(body);
        return NextResponse.json(venue, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create venue' }, { status: 500 });
    }
}
