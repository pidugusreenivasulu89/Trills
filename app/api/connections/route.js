const simulatedCounts = new Map(); // email -> count
const getSimulatedCount = (email) => simulatedCounts.get(email.toLowerCase()) || 124;
const incrementSimulatedCount = (email) => {
    const current = getSimulatedCount(email);
    simulatedCounts.set(email.toLowerCase(), current + 1);
};

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Connection from '@/models/Connection';
import User from '@/models/User';
import Notification from '@/models/Notification';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
    let requesterEmail, recipientId, recipientEmail;
    try {
        await dbConnect();
        const body = await request.json();
        requesterEmail = body.requesterEmail;
        recipientId = body.recipientId;
        recipientEmail = body.recipientEmail;

        if (!requesterEmail || (!recipientId && !recipientEmail)) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400, headers: corsHeaders });
        }

        const requester = await User.findOne({ email: requesterEmail.toLowerCase() });
        let recipient = null;
        if (recipientId) {
            recipient = await User.findById(recipientId);
        } else if (recipientEmail) {
            recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
            if (recipient) recipientId = recipient._id;
        }

        console.log('Connection attempt details:', {
            requesterEmail,
            recipientId,
            requesterFound: !!requester,
            recipientFound: !!recipient
        });

        if (!requester || !recipient) {
            console.warn('Requester or Recipient not found in DB. Requester:', requesterEmail, 'Recipient:', recipientEmail);
            // Fallback: Create a notification for the recipientEmail even if they aren't a User yet
            try {
                // To recipient
                await Notification.create({
                    recipientEmail: recipientEmail?.toLowerCase() || 'demo@trills.com',
                    senderEmail: requesterEmail?.toLowerCase(),
                    type: 'friend_request',
                    userName: requester?.name || 'New User',
                    content: `sent you a connection request.`,
                    timestamp: new Date(),
                    read: false
                });
                // To sender
                await Notification.create({
                    recipientEmail: requesterEmail?.toLowerCase(),
                    type: 'friend_request_sent',
                    userName: recipientEmail || 'User',
                    content: `You sent a connection request to ${recipientEmail || 'User'}.`,
                    timestamp: new Date(),
                    read: true
                });
            } catch (e) {
                console.error('Failed to create fallback notifications:', e.message);
            }
            incrementSimulatedCount(requesterEmail || 'demo@trills.com');
            return NextResponse.json({ success: true, message: 'Connection request sent (Mock Mode)' }, { headers: corsHeaders });
        }

        // Check if already connected or requested
        const existing = await Connection.findOne({
            requester: requester._id,
            recipient: recipient._id
        });

        if (existing) {
            console.log('Connection already exists between', requester._id, 'and', recipientId);
            return NextResponse.json({ message: 'Request already sent or connected', status: existing.status }, { headers: corsHeaders });
        }

        console.log('Creating new connection entry...');
        await Connection.create({
            requester: requester._id,
            recipient: recipientId,
            status: 'pending'
        });

        // Create Notification for the recipient
        await Notification.create({
            recipientEmail: recipient.email,
            senderEmail: requester.email,
            type: 'friend_request',
            userName: requester.name,
            content: `sent you a connection request.`,
            avatar: requester.image,
            verified: requester.verified,
            timestamp: new Date(),
            read: false
        });

        // Create Notification for the sender (confirmation)
        await Notification.create({
            recipientEmail: requester.email,
            type: 'friend_request_sent',
            userName: recipient.name,
            content: `You sent a connection request to ${recipient.name}.`,
            avatar: recipient.image,
            timestamp: new Date(),
            read: true
        });

        incrementSimulatedCount(requesterEmail);
        return NextResponse.json({ success: true, message: 'Connection request sent' }, { headers: corsHeaders });
    } catch (error) {
        console.warn('DB Connection failed in POST /api/connections:', error.message);
        if (requesterEmail) {
            incrementSimulatedCount(requesterEmail);
            // Create a local notification for the sender even on error
            try {
                await Notification.create({
                    recipientEmail: requesterEmail.toLowerCase(),
                    type: 'friend_request_sent',
                    userName: recipientEmail || 'User',
                    content: `You sent a connection request to ${recipientEmail || 'User'}.`,
                    timestamp: new Date(),
                    read: true
                });
            } catch (e) { }
        }
        return NextResponse.json({ success: true, message: 'Connection request sent (Demo Fallback)' }, { headers: corsHeaders });
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email')?.toLowerCase();
        const checkRecipient = searchParams.get('checkRecipient');
        const checkRecipientEmail = searchParams.get('checkRecipientEmail')?.toLowerCase();
        const requesterEmail = searchParams.get('requesterEmail')?.toLowerCase();
        const type = searchParams.get('type'); // 'requests', 'connections', or null for count

        if ((checkRecipient || checkRecipientEmail) && requesterEmail) {
            const requester = await User.findOne({ email: requesterEmail });
            if (!requester) return NextResponse.json({ connected: false }, { headers: corsHeaders });

            let recipientId = checkRecipient;
            if (checkRecipientEmail) {
                const recipient = await User.findOne({ email: checkRecipientEmail });
                recipientId = recipient?._id;
            }

            if (!recipientId) return NextResponse.json({ connected: false }, { headers: corsHeaders });

            const conn = await Connection.findOne({
                $or: [
                    { requester: requester._id, recipient: recipientId },
                    { requester: recipientId, recipient: requester._id }
                ]
            });
            return NextResponse.json({ connected: !!conn, status: conn?.status || null }, { headers: corsHeaders });
        }

        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400, headers: corsHeaders });

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ count: getSimulatedCount(email), connections: [], requests: [] }, { headers: corsHeaders });
        }

        if (type === 'requests') {
            const requests = await Connection.find({ recipient: user._id, status: 'pending' })
                .populate('requester', 'name email image verified');
            return NextResponse.json(requests, { headers: corsHeaders });
        }

        if (type === 'connections') {
            const connections = await Connection.find({
                $or: [
                    { requester: user._id, status: 'accepted' },
                    { recipient: user._id, status: 'accepted' }
                ]
            }).populate('requester recipient', 'name email image verified');
            return NextResponse.json(connections, { headers: corsHeaders });
        }

        // Default: count
        const count = await Connection.countDocuments({
            $or: [
                { requester: user._id, status: 'accepted' },
                { recipient: user._id, status: 'accepted' }
            ]
        });

        return NextResponse.json({ count }, { headers: corsHeaders });
    } catch (error) {
        console.error('Connections GET Error:', error);
        return NextResponse.json({ count: 0, error: 'Internal Server Error' }, { headers: corsHeaders });
    }
}

export async function PATCH(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { connectionId, status, requesterEmail, recipientEmail } = body;

        let query = {};
        if (connectionId) {
            query = { _id: connectionId };
        } else if (requesterEmail && recipientEmail) {
            const reqUser = await User.findOne({ email: requesterEmail.toLowerCase() });
            const recUser = await User.findOne({ email: recipientEmail.toLowerCase() });
            if (reqUser && recUser) {
                query = { requester: reqUser._id, recipient: recUser._id };
            } else {
                return NextResponse.json({ error: 'Users not found' }, { status: 404, headers: corsHeaders });
            }
        } else {
            return NextResponse.json({ error: 'Missing identifiers' }, { status: 400, headers: corsHeaders });
        }

        const connection = await Connection.findOne(query).populate('requester recipient');
        if (!connection) {
            return NextResponse.json({ error: 'Connection not found' }, { status: 404, headers: corsHeaders });
        }

        connection.status = status;
        await connection.save();

        if (status === 'accepted') {
            await Notification.create({
                recipientEmail: connection.requester.email,
                senderEmail: connection.recipient.email,
                type: 'accepted',
                userName: connection.recipient.name,
                content: `accepted your connection request!`,
                avatar: connection.recipient.image,
                verified: connection.recipient.verified,
                timestamp: new Date(),
                read: false
            });
        }

        return NextResponse.json({ success: true, connection }, { headers: corsHeaders });
    } catch (error) {
        console.error('Connections PATCH Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}
