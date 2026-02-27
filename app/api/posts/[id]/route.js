import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Post from '../../../../models/Post';

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const { id } = params;
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
        const { id } = params;
        const body = await request.json();
        const post = await Post.findByIdAndUpdate(id, body, { new: true });
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
