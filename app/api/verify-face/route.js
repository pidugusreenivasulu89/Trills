import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// Next.js App Router handles body size limits differently, old config export is ignored/errors out

export async function POST(req) {
    try {
        console.log('--- Verification Request Start ---');
        const body = await req.json();
        console.log('Request Body Keys:', Object.keys(body));

        const { faceImage, email, location } = body;
        console.log('Extracted Email:', email);
        console.log('Location Provided:', !!location);

        let userEmail;
        const session = await getServerSession(authOptions);

        if (session) {
            console.log('Session Found for:', session.user.email);
            userEmail = session.user.email.toLowerCase();
        } else if (email) {
            console.log('No Session, using provided email:', email);
            userEmail = email.toLowerCase();
        } else {
            console.error('No Session or Email provided');
            return NextResponse.json({ error: 'Unauthorized: No session or email found' }, { status: 401 });
        }

        if (!faceImage) {
            return NextResponse.json({ error: 'Face image is required' }, { status: 400 });
        }

        await dbConnect();

        const user = await User.findOneAndUpdate(
            { email: userEmail },
            {
                email: userEmail, // Ensure email is set on upsert
                name: body.name || userEmail.split('@')[0], // Fallback name
                verified: true,
                faceImage: faceImage,
                image: faceImage, // Set the verified face as the main profile picture
                verificationLocation: location ? {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    timestamp: new Date()
                } : null
            },
            { new: true, upsert: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'Failed to create or update user profile' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Identity verified and stored successfully',
            user: {
                name: user.name,
                verified: user.verified
            }
        });

    } catch (error) {
        console.error('Verification Route Error:', error);
        return NextResponse.json({
            error: 'Server Error',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
