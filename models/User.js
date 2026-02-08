import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // Mobile Login
    password: String, // For email/password authentication
    otp: String, // Temporary OTP
    otpExpires: Date,
    image: String,
    verified: { type: Boolean, default: false },
    designation: String,
    location: String,
    interests: [String],
    faceImage: String,
    verificationLocation: {
        latitude: Number,
        longitude: Number,
        timestamp: Date
    },
    authProvider: { type: String, enum: ['email', 'google', 'facebook', 'apple'], default: 'email' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    // Loyalty Program
    points: { type: Number, default: 0 },
    tier: { type: String, enum: ['Silver', 'Gold', 'Platinum', 'Black'], default: 'Silver' },
    pointsHistory: [{
        source: String, // e.g., 'Booking', 'Connection', 'Bonus'
        points: Number,
        timestamp: { type: Date, default: Date.now }
    }],

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
