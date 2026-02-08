'use client';

import { SessionProvider } from "next-auth/react";

// Import Amplify config with error handling
if (typeof window !== 'undefined') {
    try {
        require('@/lib/amplifyConfig');
    } catch (error) {
        console.error('Amplify configuration error:', error);
    }
}

export function Providers({ children }) {
    return <SessionProvider>{children}</SessionProvider>;
}
