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

        if (email) {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
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
                    points: user.points || 0,
                    tier: user.tier || 'Silver'
                }
            }, { headers: corsHeaders });
        }

        // Fetch only verified users to see the face data and locations
        const verifiedUsers = await User.find({ verified: true }).select('name email faceImage verificationLocation verified');

        return NextResponse.json({
            success: true,
            count: verifiedUsers.length,
            users: verifiedUsers.map(u => ({
                name: u.name,
                email: u.email,
                isVerified: u.verified,
                location: u.verificationLocation ?
                    `https://www.google.com/maps?q=${u.verificationLocation.latitude},${u.verificationLocation.longitude}` :
                    'No location captured',
                capturedAt: u.verificationLocation?.timestamp || 'N/A',
                // Truncate photo for readability in JSON
                photoPreview: u.faceImage ? u.faceImage.substring(0, 50) + '...' : 'No photo'
            }))
        }, { headers: corsHeaders });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
    }
}
