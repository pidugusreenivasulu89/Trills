import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Venue from '@/models/Venue';

export async function DELETE(request, { params }) {
    await dbConnect();
    const { id } = await params;
    await Venue.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Venue deleted' });
}

export async function PUT(request, { params }) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedVenue = await Venue.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json(updatedVenue);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update venue' }, { status: 500 });
    }
}
