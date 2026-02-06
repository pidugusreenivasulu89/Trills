import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
    const envState = {
        hasMongoUri: !!process.env.MONGODB_URI,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasFacebookId: !!process.env.FACEBOOK_CLIENT_ID,
        hasFacebookSecret: !!process.env.FACEBOOK_CLIENT_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
        deployedAt: '2026-02-06 23:12:00 IST'
    };

    try {
        console.log('API DB Test: Checking connection with env:', envState);

        if (!process.env.MONGODB_URI) {
            return NextResponse.json({
                status: 'error',
                message: 'MONGODB_URI is missing from Amplify environment variables.',
                env: envState
            }, { status: 500 });
        }

        await dbConnect();

        const state = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
        };

        return NextResponse.json({
            status: 'success',
            message: 'Database connection established',
            readyState: states[state],
            dbName: mongoose.connection.name,
            env: envState
        });
    } catch (error) {
        console.error('API DB Test Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code || 'UNKNOWN',
            env: envState,
            tip: 'Check your MongoDB Atlas Network Access (IP Whitelist 0.0.0.0/0).'
        }, { status: 500 });
    }
}
