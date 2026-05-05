import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Connection from '@/models/Connection';

export async function GET() {
    try {
        await dbConnect();

        const seedUsers = [
            { email: 'sreenivas@trills.com', name: 'Sreenivasulu', username: 'sreenivas', verified: true, role: 'admin', isPrivate: false },
            { email: 'alex@trills.com', name: 'Alex Rivera', username: 'alex_rivera', verified: true, isBot: true, image: 'https://i.pravatar.cc/150?u=alex', designation: 'Community Host', location: 'Bangalore, Karnataka', bio: 'I welcome new members, share venue tips, and keep the Trills feed warm.' },
            { email: 'sarah@trills.com', name: 'Sarah Jenkins', username: 'sarah_j', verified: true, isBot: true, image: 'https://i.pravatar.cc/150?u=sarah', designation: 'UX Lead', location: 'Mumbai, Maharashtra', bio: 'Design thinker, brunch planner, and coworking space scout.' },
            { email: 'elena@trills.com', name: 'Elena Rodriguez', username: 'elena_r', verified: true, isBot: true, image: 'https://i.pravatar.cc/150?u=elena', designation: 'Product Manager', location: 'Delhi NCR', bio: 'Always looking for thoughtful conversations and product meetups.' },
            { email: 'marcus@trills.com', name: 'Marcus Chen', username: 'marcus_c', verified: true, isBot: true, image: 'https://i.pravatar.cc/150?u=marcus', designation: 'Founding Engineer', location: 'Hyderabad, Telangana', bio: 'Builder, React nerd, and regular at founder nights.' },
            { email: 'maya@trills.com', name: 'Maya Iyer', username: 'maya_iyer', verified: true, isBot: true, image: 'https://i.pravatar.cc/150?u=maya', designation: 'Startup Operator', location: 'Pune, Maharashtra', bio: 'Happy to suggest events and make intros when the room feels quiet.' },
        ];

        const users = [];
        for (const u of seedUsers) {
            const user = await User.findOneAndUpdate(
                { email: u.email },
                u,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            users.push(user);
        }

        const primary = users.find((user) => user.email === 'sreenivas@trills.com');
        const botUsers = users.filter((user) => user.email !== 'sreenivas@trills.com');
        if (primary) {
            for (const bot of botUsers) {
                const existing = await Connection.findOne({
                    $or: [
                        { requester: primary._id, recipient: bot._id },
                        { requester: bot._id, recipient: primary._id }
                    ]
                });

                if (existing) {
                    existing.status = 'accepted';
                    await existing.save();
                } else {
                    await Connection.create({ requester: primary._id, recipient: bot._id, status: 'accepted' });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Seed users and bot connections created/updated successfully',
            count: seedUsers.length
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
