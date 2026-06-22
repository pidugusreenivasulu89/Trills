import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/models/Message';
import Connection from '@/models/Connection';
import User from '@/models/User';

const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' };
export async function OPTIONS() { return NextResponse.json({}, { headers }); }

const areConnected = async (firstEmail, secondEmail) => {
    const [first, second] = await Promise.all([User.findOne({ email: firstEmail }), User.findOne({ email: secondEmail })]);
    if (!first || !second) return false;
    return !!(await Connection.exists({ status: 'accepted', $or: [{ requester: first._id, recipient: second._id }, { requester: second._id, recipient: first._id }] }));
};

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get('userEmail')?.toLowerCase();
        const recipientEmail = searchParams.get('recipientEmail')?.toLowerCase();
        if (!userEmail || !recipientEmail) return NextResponse.json({ error: 'Both users are required' }, { status: 400, headers });
        if (!(await areConnected(userEmail, recipientEmail))) return NextResponse.json({ error: 'Messaging is available between accepted connections' }, { status: 403, headers });
        const messages = await Message.find({ $or: [{ senderEmail: userEmail, recipientEmail }, { senderEmail: recipientEmail, recipientEmail: userEmail }] }).sort({ createdAt: 1 }).limit(500).lean();
        return NextResponse.json({ messages }, { headers });
    } catch (error) { return NextResponse.json({ error: 'Failed to load messages' }, { status: 500, headers }); }
}

export async function POST(request) {
    try {
        await dbConnect();
        const { senderEmail, recipientEmail, body } = await request.json();
        const sender = senderEmail?.toLowerCase(); const recipient = recipientEmail?.toLowerCase(); const messageBody = body?.trim();
        if (!sender || !recipient || !messageBody) return NextResponse.json({ error: 'Sender, recipient and message are required' }, { status: 400, headers });
        if (!(await areConnected(sender, recipient))) return NextResponse.json({ error: 'Connect before sending messages' }, { status: 403, headers });
        const message = await Message.create({ senderEmail: sender, recipientEmail: recipient, body: messageBody });
        return NextResponse.json({ message }, { status: 201, headers });
    } catch (error) { return NextResponse.json({ error: 'Failed to send message' }, { status: 500, headers }); }
}
