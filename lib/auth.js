import { getCurrentUser, fetchUserAttributes, signOut } from 'aws-amplify/auth';

export async function getAmplifyUser() {
    try {
        const user = await getCurrentUser();
        const attributes = await fetchUserAttributes();
        return {
            ...user,
            ...attributes,
            // Map common attributes to our app's profile structure
            name: attributes.name || attributes.nickname || attributes.email?.split('@')[0] || 'User',
            email: attributes.email,
            avatar: attributes.picture || null,
        };
    } catch (error) {
        return null;
    }
}

export async function amplifySignOut() {
    try {
        await signOut();
    } catch (error) {
        console.error('Error signing out:', error);
    }
}
