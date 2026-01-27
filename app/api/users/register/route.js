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

        const { name, username, email, phone, password, authProvider } = await request.json();

        // Validate required fields
        if (!name || !username || !email) {
            return NextResponse.json(
                { error: 'Name, username, and email are required' },
                { status: 400, headers: corsHeaders }
            );
        }

        // Check if username already exists
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return NextResponse.json(
                { error: 'Username already taken' },
                { status: 409, headers: corsHeaders }
            );
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409, headers: corsHeaders }
            );
        }

        // Check if phone already exists (if provided)
        if (phone) {
            const existingPhone = await User.findOne({ phone });
            if (existingPhone) {
                return NextResponse.json(
                    { error: 'Phone number already registered' },
                    { status: 409, headers: corsHeaders }
                );
            }
        }

        // Hash password if provided (for email/password auth)
        let hashedPassword = null;
        if (password && authProvider === 'email') {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        // Create new user
        const user = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            phone,
            password: hashedPassword,
            authProvider: authProvider || 'email',
            verified: false
        });

        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            verified: user.verified,
            role: user.role || 'user',
            authProvider: user.authProvider,
            createdAt: user.createdAt
        };

        return NextResponse.json(
            { message: 'User registered successfully', user: userResponse },
            { status: 201, headers: corsHeaders }
        );

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register user', details: error.message },
            { status: 500, headers: corsHeaders }
        );
    }
}

// Check username availability
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json(
                { error: 'Username parameter is required' },
                { status: 400, headers: corsHeaders }
            );
        }

        const existingUser = await User.findOne({ username: username.toLowerCase() });

        return NextResponse.json({
            available: !existingUser,
            username: username.toLowerCase()
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Username check error:', error);
        return NextResponse.json(
            { error: 'Failed to check username availability' },
            { status: 500, headers: corsHeaders }
        );
    }
}
