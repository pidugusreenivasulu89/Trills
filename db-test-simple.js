const mongoose = require('mongoose');
const fs = require('fs');

async function testConnection() {
    try {
        console.log('Reading .env.local...');
        const env = fs.readFileSync('.env.local', 'utf8');
        const uriMatch = env.match(/MONGODB_URI=(.*)/);

        if (!uriMatch) {
            console.error('MONGODB_URI not found in .env.local');
            return;
        }

        const uri = uriMatch[1].trim();
        console.log('Attempting to connect to:', uri.split('@')[1]); // Log host part only for security

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000
        });

        console.log('SUCCESS: Successfully connected to MongoDB cluster.');

        const admin = mongoose.connection.db.admin();
        const info = await admin.serverStatus();
        console.log('MongoDB Version:', info.version);

        await mongoose.disconnect();
        console.log('Disconnected.');
    } catch (err) {
        console.error('DATABASE CONNECTION ERROR:');
        console.error('Code:', err.code);
        console.error('Message:', err.message);
        console.log('\nCommon fixes:');
        console.log('1. Check if your IP is whitelisted in MongoDB Atlas (Network Access).');
        console.log('2. Check if the database user password in .env.local is correct.');
        console.log('3. Check if the cluster name is correct.');
    }
}

testConnection();
