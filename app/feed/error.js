'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        console.error('Feed page error:', error);
    }, [error]);

    return (
        <div className="container" style={{ paddingTop: '120px', textAlign: 'center' }}>
            <div className="glass-card" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
                <h2 className="title-font" style={{ fontSize: '2rem', marginBottom: '20px', color: 'var(--accent)' }}>
                    Something went wrong!
                </h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '10px', fontSize: '1rem' }}>
                    We encountered an error while loading the feed.
                </p>
                <details style={{ marginTop: '20px', textAlign: 'left', background: 'rgba(244, 63, 94, 0.1)', padding: '15px', borderRadius: '8px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: '600', marginBottom: '10px' }}>
                        Error Details
                    </summary>
                    <pre style={{ fontSize: '0.85rem', overflow: 'auto', color: 'var(--text-main)' }}>
                        {error?.message || 'Unknown error'}
                    </pre>
                    {error?.stack && (
                        <pre style={{ fontSize: '0.75rem', overflow: 'auto', marginTop: '10px', color: 'var(--text-muted)' }}>
                            {error.stack}
                        </pre>
                    )}
                </details>
                <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button
                        onClick={() => reset()}
                        className="btn-primary"
                        style={{ padding: '10px 25px' }}
                    >
                        Try Again
                    </button>
                    <a
                        href="/"
                        className="btn-outline"
                        style={{ padding: '10px 25px', textDecoration: 'none', display: 'inline-block' }}
                    >
                        Go Home
                    </a>
                </div>
            </div>
        </div>
    );
}
