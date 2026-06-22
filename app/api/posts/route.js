import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';

const safeText = (value, fallback = '') => {
    if (typeof value === 'string') return value.trim();
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
};

const safeUrl = (value) => {
    const text = safeText(value);
    return /^https?:\/\//i.test(text) ? text : undefined;
};

const cleanPostBody = (body = {}) => {
    const rawUser = body.user && typeof body.user === 'object' ? body.user : {};
    const user = safeText(body.user, safeText(rawUser.name || rawUser.fullName || rawUser.email, 'Trills Member'));
    const email = safeText(body.email, safeText(rawUser.email, `${user.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '') || 'member'}@trills.com`));
    const content = safeText(body.content, safeText(body.description));

    return {
        user,
        email,
        avatar: safeUrl(body.avatar || rawUser.avatar || rawUser.image),
        content,
        image: safeUrl(body.image),
        type: body.type === 'promo' ? 'promo' : 'post',
    };
};

export async function GET() {
    try {
        await dbConnect();
        const posts = await Post.find({}).sort({ createdAt: -1 });
        return NextResponse.json(posts);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const payload = cleanPostBody(body);
        if (!payload.content) {
            return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
        }
        const post = await Post.create(payload);
        return NextResponse.json(post, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
