import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email')?.toLowerCase();

        let query = {};
        if (email) {
            query.recipientEmail = email;
        }

        const notifications = await Notification.find(query).sort({ timestamp: -1 });
        return NextResponse.json(notifications, { headers: corsHeaders });
    } catch (error) {
        console.error('CRITICAL: Notifications fetch failed:', error.message);
        return NextResponse.json([], { headers: corsHeaders });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { action, notification } = body;

        if (action === 'markRead') {
            await Notification.updateMany({ read: false }, { $set: { read: true } });
            return NextResponse.json({ message: 'Notifications marked as read' }, { headers: corsHeaders });
        }

        if (notification) {
            const newNotif = await Notification.create(notification);
            return NextResponse.json(newNotif, { headers: corsHeaders });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to process notification' }, { status: 500, headers: corsHeaders });
    }
}
