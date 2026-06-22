import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    senderEmail: { type: String, required: true, lowercase: true, index: true },
    recipientEmail: { type: String, required: true, lowercase: true, index: true },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now, index: true },
});

MessageSchema.index({ senderEmail: 1, recipientEmail: 1, createdAt: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
