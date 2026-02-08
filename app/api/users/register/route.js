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

        const { name, username, email, phone, password, authProvider, image } = await request.json();

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
            image,
            authProvider: authProvider || 'email',
            verified: false
        });

        // Send Verification Email
        try {
            const nodemailer = require('nodemailer');

            // Check if credentials exist
            if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: `"Trills Team" <${process.env.EMAIL_USER}>`,
                    to: email,
                    subject: 'Welcome to Trills! Please Verify Your Email',
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <div style="text-align: center; margin-bottom: 30px;">
                                <h1 style="color: #4B184C; margin: 0;">Trills</h1>
                                <p style="color: #666; font-size: 14px;">Dine, Work, & Connect</p>
                            </div>
                            
                            <h2 style="color: #4B184C;">Welcome, ${name}!</h2>
                            <p>Thanks for joining the Trills community. We're excited to have you on board.</p>
                            
                            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                                <p style="margin: 0; font-weight: bold;">Verify your account to unlock full features:</p>
                                <a href="${process.env.NEXTAUTH_URL}/profile?verify=true" style="display: inline-block; background-color: #4B184C; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 10px;">Verify Identity</a>
                            </div>

                            <p>If you have any questions, feel free to reply to this email.</p>
                            
                            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                            <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 Trills. All rights reserved.</p>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('Verification email sent to:', email);
            } else {
                console.warn('Email credentials (EMAIL_USER, EMAIL_PASS) not found in .env.local. Email not sent.');
            }
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail the registration if email fails
        }

        // Return user data without password
        const userResponse = {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            image: user.image,
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
