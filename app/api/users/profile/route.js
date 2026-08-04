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
        const email = new URL(request.url).searchParams.get('email')?.toLowerCase();
        if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders });
        const user = await User.findOne({ email }).select('name username email image photos verified designation location profileLocation interests isPrivate bio role points tier createdAt').lean();
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
        return NextResponse.json({ user: { ...user, avatar: user.image || '' } }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to load profile' }, { status: 500, headers: corsHeaders });
    }
}

export async function PATCH(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { email, ...updateData } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders });
        }

        // Map frontend fields (avatar) to backend fields (image) without clearing an existing photo accidentally.
        if (typeof updateData.avatar === 'string' && updateData.avatar.trim()) {
            updateData.image = updateData.avatar;
        }
        delete updateData.avatar;
        if (typeof updateData.image === 'string' && !updateData.image.trim()) delete updateData.image;

        const user = await User.findOneAndUpdate(
            { email: email.toLowerCase() },
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                avatar: user.image,
                photos: user.photos || [],
                designation: user.designation,
                location: user.location,
                profileLocation: user.profileLocation,
                interests: user.interests,
                verified: user.verified,
                isPrivate: user.isPrivate || false,
                bio: user.bio,
                role: user.role || 'user',
                points: user.points ?? 0,
                tier: user.tier || 'Silver',
                createdAt: user.createdAt
            }
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500, headers: corsHeaders });
    }
}
