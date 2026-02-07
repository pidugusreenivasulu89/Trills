import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request) {
    try {
        await dbConnect();
        const { name, email, image, provider, providerId } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Generate a unique username from email
            let baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-0]/g, '');
            let username = baseUsername;
            let counter = 1;

            // Check if username already exists and increment if it does
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                name,
                username,
                email: email.toLowerCase(),
                image,
                authProvider: provider,
                verified: false
            });
        } else {
            // Update provider if not set or different
            if (!user.authProvider || user.authProvider === 'email') {
                user.authProvider = provider;
                if (image && !user.image) user.image = image;
                await user.save();
            }
        }

        const userResponse = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            image: user.image,
            verified: user.verified,
            designation: user.designation,
            location: user.location,
            role: user.role || 'user',
            createdAt: user.createdAt
        };

        return NextResponse.json(
            { message: 'Social login successful', user: userResponse },
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error('Social Auth Error:', error);
        return NextResponse.json(
            { error: 'Authentication failed', details: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
