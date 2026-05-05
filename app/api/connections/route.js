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
        requesterEmail = body.requesterEmail?.toLowerCase();
        recipientId = body.recipientId;
        recipientEmail = body.recipientEmail?.toLowerCase();

        if (!requesterEmail || (!recipientId && !recipientEmail)) {
            return NextResponse.json({ error: 'Missing requester or recipient details' }, { status: 400, headers: corsHeaders });
        }

        const requester = await User.findOne({ email: requesterEmail });
        let recipient = null;
        if (recipientId) {
            recipient = await User.findById(recipientId);
        } else if (recipientEmail) {
            recipient = await User.findOne({ email: recipientEmail });
            if (recipient) recipientId = recipient._id;
        }

        if (!requester || !recipient) {
            console.warn('Requester or Recipient not found in DB. Requester:', requesterEmail, 'Recipient:', recipientEmail);
            return NextResponse.json({ error: 'One or both users not found' }, { status: 404, headers: corsHeaders });
        }

        if (requester._id.toString() === recipient._id.toString()) {
            return NextResponse.json({ error: 'You cannot connect with yourself' }, { status: 400, headers: corsHeaders });
        }

        // Check if already connected or requested (bidirectional)
        const existing = await Connection.findOne({
            $or: [
                { requester: requester._id, recipient: recipient._id },
                { requester: recipient._id, recipient: requester._id }
            ]
        });

        if (existing) {
            console.log('Connection already exists or pending between', requester._id, 'and', recipient._id);
            return NextResponse.json({
                success: false,
                message: 'A connection or request already exists between these users',
                status: existing.status
            }, { status: 409, headers: corsHeaders });
        }

        console.log('Creating new connection entry...');
        const newConnection = await Connection.create({
            requester: requester._id,
            recipient: recipient._id,
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

        // Create Notification for the sender (confirmation/record)
        await Notification.create({
            recipientEmail: requester.email,
            senderEmail: recipient.email,
            type: 'friend_request_sent',
            userName: recipient.name,
            content: `You sent a connection request to ${recipient.name}.`,
            avatar: recipient.image,
            verified: recipient.verified,
            timestamp: new Date(),
            read: true // Read by default for the sender
        });

        return NextResponse.json({
            success: true,
            message: 'Connection request sent',
            connection: newConnection
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('CRITICAL: Connection POST Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
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
            }).populate('requester recipient', 'name email image verified designation location isPrivate isBot');

            const normalized = connections
                .map((connection) => {
                    const requester = connection.requester;
                    const recipient = connection.recipient;
                    const otherUser = requester._id.toString() === user._id.toString() ? recipient : requester;
                    return {
                        id: connection._id,
                        status: connection.status,
                        connectedAt: connection.createdAt,
                        user: {
                            id: otherUser._id,
                            name: otherUser.name,
                            email: otherUser.email,
                            image: otherUser.image,
                            avatar: otherUser.image,
                            verified: otherUser.verified,
                            designation: otherUser.designation,
                            location: otherUser.location,
                            isPrivate: otherUser.isPrivate || false,
                            isBot: otherUser.isBot || false
                        }
                    };
                })
                .filter((connection) => !connection.user.isPrivate);

            return NextResponse.json(normalized, { headers: corsHeaders });
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
