import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
    try {
        await dbConnect();
        const { phone } = await request.json();

        if (!phone) {
            return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return NextResponse.json({ error: 'User not found with this phone number' }, { status: 404 });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // In production, send SMS here. 
        // For development, we return the OTP in the response or log it.
        console.log(`Generated OTP for ${phone}: ${otp}`);

        return NextResponse.json({
            message: 'OTP sent successfully',
            otp: otp // REMOVE THIS IN PRODUCTION
        });

    } catch (error) {
        console.error('OTP Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate OTP' }, { status: 500 });
    }
}
