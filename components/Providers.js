'use client';

import { SessionProvider } from "next-auth/react";
import '@/lib/amplifyConfig';

export function Providers({ children }) {
    return <SessionProvider>{children}</SessionProvider>;
}
