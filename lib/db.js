import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

let lastFail = 0;
const FAIL_COOLDOWN = 30000; // 30 seconds

async function dbConnect() {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in the environment variables.');
    }

    if (cached.conn) {
        return cached.conn;
    }

    // Fail fast if we recently had a timeout/error
    if (Date.now() - lastFail < FAIL_COOLDOWN && !cached.promise) {
        throw new Error('Database recently failed, skipping connection attempt for stability.');
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // Increased for stability
        };

        console.log('Attempting to connect to MongoDB...');
        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('Successfully connected to MongoDB');
            lastFail = 0;
            return mongoose;
        }).catch(err => {
            console.error('MongoDB connection error:', err.message);
            lastFail = Date.now();
            cached.promise = null;
            throw err;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        console.error('Failed to resolve MongoDB connection:', e.message);
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
