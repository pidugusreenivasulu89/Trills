import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Post from '@/models/Post';
import Notification from '@/models/Notification';

const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const normalizeComments = (comments) => {
    if (Array.isArray(comments)) return comments;
    return [];
};

const publicPost = (post) => {
    if (!post) return null;
    const json = typeof post.toObject === 'function' ? post.toObject() : post;
    return {
        ...json,
        comments: normalizeComments(json.comments),
        likes: Math.max(0, Number(json.likes) || 0),
        likedBy: Array.isArray(json.likedBy) ? json.likedBy : [],
    };
};

const createEngagementNotification = async (post, actor, type, content) => {
    const recipientEmail = normalizeEmail(post.email);
    const senderEmail = normalizeEmail(actor?.email);
    if (!recipientEmail || !senderEmail || recipientEmail === senderEmail) return;

    await Notification.create({
        recipientEmail,
        senderEmail,
        type,
        userName: actor?.name || senderEmail.split('@')[0],
        content,
        avatar: actor?.avatar || actor?.image,
        verified: Boolean(actor?.verified),
        timestamp: new Date(),
        read: false,
        link: `/feed?post=${post._id}`,
    });
};

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const post = await Post.findById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json(publicPost(post));
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Post deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const post = await Post.findByIdAndUpdate(id, body, { new: true });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json(publicPost(post));
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(request, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();
        const action = body?.action;
        const actor = body?.user || {};
        const actorEmail = normalizeEmail(actor.email);
        const post = await Post.findById(id);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        if (action === 'like') {
            if (!actorEmail) {
                return NextResponse.json({ error: 'User email is required' }, { status: 400 });
            }

            const likedBy = Array.isArray(post.likedBy) ? post.likedBy.map(normalizeEmail).filter(Boolean) : [];
            const isLiked = likedBy.includes(actorEmail);
            post.likedBy = isLiked ? likedBy.filter(email => email !== actorEmail) : [...likedBy, actorEmail];
            post.likes = post.likedBy.length;
            post.comments = normalizeComments(post.comments);
            await post.save();

            if (!isLiked) {
                await createEngagementNotification(post, actor, 'heart', 'liked your post.');
            }

            return NextResponse.json(publicPost(post));
        }

        if (action === 'comment') {
            const text = typeof body?.text === 'string' ? body.text.trim() : '';
            if (!actorEmail || !text) {
                return NextResponse.json({ error: 'Comment and user email are required' }, { status: 400 });
            }

            const comments = normalizeComments(post.comments);
            comments.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                user: actor.name || actorEmail.split('@')[0],
                email: actorEmail,
                avatar: actor.avatar || actor.image || '',
                text,
                createdAt: new Date(),
            });
            post.comments = comments;
            await post.save();

            await createEngagementNotification(post, actor, 'comment', 'commented on your post.');
            return NextResponse.json(publicPost(post));
        }

        return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
