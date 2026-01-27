const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Manual env load
const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const lines = envContent.split('\n');
let MONGODB_URI = '';
for (const line of lines) {
    if (line.startsWith('MONGODB_URI=')) {
        MONGODB_URI = line.split('=')[1].trim().replace(/['"]/g, '');
        break;
    }
}

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: String,
    username: { type: String },
    email: { type: String },
    verified: { type: Boolean, default: false },
    role: { type: String, default: 'user' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected.');

        const seedUsers = [
            { email: 'alex@trills.com', name: 'Alex Rivera', username: 'alex_rivera', verified: true },
            { email: 'sarah@trills.com', name: 'Sarah Jenkins', username: 'sarah_j', verified: false },
            { email: 'elena@trills.com', name: 'Elena R.', username: 'elena_r', verified: true },
            { email: 'marcus@trills.com', name: 'Marcus Chen', username: 'marcus_c', verified: true },
            { email: 'sreenivas@trills.com', name: 'Sreenivasulu', username: 'sreenivas', verified: true, role: 'admin' },
        ];

        for (const u of seedUsers) {
            await User.findOneAndUpdate({ email: u.email.toLowerCase() }, u, { upsert: true });
            console.log('Seeded:', u.email);
        }

        console.log('Seed complete.');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Seed Error:', err);
    }
}

seed();
