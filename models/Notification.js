import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
    recipientEmail: { type: String, required: true },
    senderEmail: { type: String },
    type: { type: String, required: true },
    userName: { type: String, default: '' },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    avatar: String,
    verified: { type: Boolean, default: false },
    link: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
