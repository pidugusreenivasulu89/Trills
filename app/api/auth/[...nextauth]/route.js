import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            await dbConnect();
            const dbUser = await User.findOne({ email: session.user.email });
            if (dbUser) {
                session.user.id = dbUser._id;
                session.user.verified = dbUser.verified;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            try {
                await dbConnect();
                const existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    // Generate a unique username from email
                    let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-0]/g, '');
                    let username = baseUsername;
                    let counter = 1;

                    // Check if username already exists and increment if it does
                    while (await User.findOne({ username })) {
                        username = `${baseUsername}${counter}`;
                        counter++;
                    }

                    await User.create({
                        name: user.name,
                        username: username,
                        email: user.email,
                        image: user.image,
                        authProvider: account.provider,
                        verified: false
                    });
                } else if (!existingUser.authProvider || existingUser.authProvider === 'email') {
                    // Update existing user's authProvider if it was previously email or not set
                    existingUser.authProvider = account.provider;
                    await existingUser.save();
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },
    },
    pages: {
        signIn: '/login',
        error: '/auth/error',
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
