import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
    try {
        console.log('API DB Test: Attempting connection');
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
            dbName: mongoose.connection.name
        });
    } catch (error) {
        console.error('API DB Test Error:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code || 'UNKNOWN',
            tip: 'If this is a timeout, check your MongoDB Atlas Network Access (IP Whitelist).'
        }, { status: 500 });
    }
}
