import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
    },
    content: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    likes: {
        type: Number,
        default: 0,
    },
    likedBy: {
        type: [String], // Array of emails who liked this post
        default: [],
    },
    comments: {
        type: mongoose.Schema.Types.Mixed,
        default: [],
    },
    type: {
        type: String,
        enum: ['post', 'promo'],
        default: 'post',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
