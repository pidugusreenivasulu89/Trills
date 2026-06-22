'use client';

import { useEffect } from 'react';

export default function FacebookCallbackPage() {
    useEffect(() => {
        const params = window.location.hash || window.location.search || '';
        window.location.replace(`trillsauth://facebook-auth${params}`);
    }, []);

    return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
            <div>
                <h1>Returning to Trills</h1>
                <p>You can close this page if the app does not open automatically.</p>
            </div>
        </main>
    );
}
