import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConn() {
    try {
        console.log('Testing connection to:', MONGODB_URI?.substring(0, 20) + '...');
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        console.log('SUCCESS: Connected to MongoDB');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        await mongoose.disconnect();
    } catch (err) {
        console.error('FAILURE: Could not connect to MongoDB');
        console.error(err);
        process.exit(1);
    }
}

testConn();
