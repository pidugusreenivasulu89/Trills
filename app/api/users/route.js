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

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        const viewerEmail = searchParams.get('viewerEmail')?.toLowerCase();

        if (email) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });

            const isOwner = viewerEmail && viewerEmail === user.email.toLowerCase();
            if (user.isPrivate && !isOwner) {
                return NextResponse.json({
                    error: 'This profile is private',
                    private: true,
                    user: {
                        id: user._id,
                        name: user.name,
                        image: user.image,
                        verified: user.verified,
                        isPrivate: true
                    }
                }, { status: 403, headers: corsHeaders });
            }

            return NextResponse.json({
                success: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    verified: user.verified,
                    designation: user.designation,
                    location: user.location,
                    image: user.image,
                    interests: user.interests || [],
                    isPrivate: user.isPrivate || false,
                    isBot: user.isBot || false,
                    bio: user.bio,
                    points: user.points || 0,
                    tier: user.tier || 'Silver'
                }
            }, { headers: corsHeaders });
        }

        return NextResponse.json(
            { error: 'Email is required' },
            { status: 400, headers: corsHeaders }
        );
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
}
