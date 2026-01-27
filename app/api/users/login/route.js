import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

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

        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401, headers: corsHeaders }
            );
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401, headers: corsHeaders }
            );
        }

        // Return user data (excluding password)
        const userResponse = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            image: user.image,
            verified: user.verified,
            role: user.role || 'user',
            createdAt: user.createdAt
        };

        return NextResponse.json(
            { message: 'Login successful', user: userResponse },
            { status: 200, headers: corsHeaders }
        );

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed', details: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}
