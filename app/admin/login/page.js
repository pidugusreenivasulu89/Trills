'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app, this would be a secure server-side check
        if (credentials.username === 'admin' && credentials.password === 'socialadmin2026') {
            localStorage.setItem('admin_auth', 'true');
            // Set the user profile to Admin so the navbar displays it correctly
            localStorage.setItem('user_profile', JSON.stringify({
                name: 'Administrator',
                designation: 'Platform Manager',
                avatar: 'https://i.pravatar.cc/150?u=admin'
            }));
            // Notify navbar to update
            window.dispatchEvent(new Event('userLogin'));
            router.push('/admin');
        } else {
            setError('Invalid admin credentials. Access denied.');
        }
    };

    return (
        <div className="container animate-fade-in" style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px'
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
                <h1 className="title-font" style={{ fontSize: '2rem', marginBottom: '10px', textAlign: 'center' }}>Admin Portal</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', textAlign: 'center', fontSize: '0.9rem' }}>Secure access for platform administrators.</p>

                {error && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', padding: '12px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.85rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Admin Username</label>
                        <input
                            type="text"
                            required
                            value={credentials.username}
                            onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'white' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Security Token</label>
                        <input
                            type="password"
                            required
                            value={credentials.password}
                            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'white' }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Authorize Access</button>
                </form>

                <p style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Unauthorized access is strictly prohibited and logged.
                </p>
            </div>
        </div>
    );
}
