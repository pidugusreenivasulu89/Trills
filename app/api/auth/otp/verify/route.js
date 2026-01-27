import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
    try {
        await dbConnect();
        const { phone, otp } = await request.json();

        if (!phone || !otp) {
            return NextResponse.json({ error: 'Phone and OTP are required' }, { status: 400 });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.otp || !user.otpExpires) {
            return NextResponse.json({ error: 'No OTP request found' }, { status: 400 });
        }

        if (user.otp !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
        }

        if (new Date() > user.otpExpires) {
            return NextResponse.json({ error: 'OTP has expired' }, { status: 400 });
        }

        // OTP Valid - Clear it
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Return user data (login session)
        const userResponse = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            image: user.image,
            verified: user.verified,
            createdAt: user.createdAt
        };

        return NextResponse.json({
            message: 'Login successful',
            user: userResponse
        });

    } catch (error) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
}
