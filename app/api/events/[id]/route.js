import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function DELETE(request, { params }) {
    await dbConnect();
    const { id } = await params;
    await Event.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Event deleted' });
}

export async function PUT(request, { params }) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await request.json();
        const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json(updatedEvent);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}
