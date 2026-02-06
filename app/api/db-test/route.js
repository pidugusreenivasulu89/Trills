import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
    const envState = {
        hasUri: !!process.env.MONGODB_URI,
        uriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[0].substring(0, 15) + '...' : 'none',
        nodeEnv: process.env.NODE_ENV,
        deployedAt: '2026-02-06 18:35:00 IST'
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
