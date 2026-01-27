import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET() {
    try {
        await dbConnect();

        const seedUsers = [
            { email: 'sreenivas@trills.com', name: 'Sreenivasulu', username: 'sreenivas', verified: true, role: 'admin' },
            { email: 'alex@trills.com', name: 'Alex Rivera', username: 'alex_rivera', verified: true },
            { email: 'sarah@trills.com', name: 'Sarah Jenkins', username: 'sarah_j', verified: false },
            { email: 'elena@trills.com', name: 'Elena R.', username: 'elena_r', verified: true },
            { email: 'marcus@trills.com', name: 'Marcus Chen', username: 'marcus_c', verified: true },
        ];

        for (const u of seedUsers) {
            await User.findOneAndUpdate(
                { email: u.email },
                u,
                { upsert: true }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Seed users created/updated successfully',
            count: seedUsers.length
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
