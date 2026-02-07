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

export async function PATCH(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { email, ...updateData } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders });
        }

        // Map frontend fields (avatar) to backend fields (image) if necessary
        if (updateData.avatar) {
            updateData.image = updateData.avatar;
            delete updateData.avatar;
        }

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
                designation: user.designation,
                location: user.location,
                interests: user.interests,
                verified: user.verified
            }
        }, { headers: corsHeaders });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500, headers: corsHeaders });
    }
}
