'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Users, Layout, Shield, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
    const [notifs, setNotifs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifs = async () => {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            setNotifs(data);
            setLoading(false);
        };
        fetchNotifs();
    }, []);

    const getTypeLabel = (type) => {
        return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    return (
        <div className="container animate-fade-in" style={{ paddingTop: '60px', paddingBottom: '100px', maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 className="title-font" style={{ fontSize: '3rem' }}>Activity Center</h1>
                <button className="btn-outline" onClick={async () => {
                    await fetch('/api/notifications', { method: 'POST', body: JSON.stringify({ action: 'markRead' }) });
                    const res = await fetch('/api/notifications');
                    setNotifs(await res.json());
                }}>Mark all as read</button>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
                {loading ? <p style={{ textAlign: 'center', padding: '40px' }}>Syncing your activity...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {notifs.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}>
                                <Sparkles size={48} color="var(--primary)" style={{ marginBottom: '20px', opacity: 0.5 }} />
                                <p style={{ color: 'var(--text-muted)' }}>No new notifications to report.</p>
                            </div>
                        ) : notifs.map(n => (
                            <div key={n.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '20px',
                                borderRadius: '15px',
                                background: n.read ? 'rgba(0,0,0,0.02)' : 'rgba(75, 24, 76, 0.08)',
                                borderBottom: '1px solid var(--border-glass)',
                                transition: '0.3s'
                            }}>
                                <img src={n.avatar} alt="User" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', fontWeight: '700' }}>
                                            {getTypeLabel(n.type)}
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {n.timestamp}</span>
                                    </div>
                                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: n.read ? '400' : '600' }}>
                                        {n.userName && <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginRight: '6px' }}>{n.userName}</span>}
                                        {n.content}
                                    </p>
                                </div>
                                {!n.read && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)' }}></div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notification Categories Section (Mobile/App View) */}
            <div className="grid-3" style={{ marginTop: '40px' }}>
                <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                    <Users size={32} color="var(--primary)" style={{ marginBottom: '15px' }} />
                    <h4 style={{ margin: '10px 0' }}>Connections</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage relationship requests</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                    <Layout size={32} color="var(--secondary)" style={{ marginBottom: '15px' }} />
                    <h4 style={{ margin: '10px 0' }}>Feed Activity</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Posts, likes, and mentions</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', padding: '30px' }}>
                    <Shield size={32} color="var(--accent)" style={{ marginBottom: '15px' }} />
                    <h4 style={{ margin: '10px 0' }}>Safety</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System and report updates</p>
                </div>
            </div>
        </div>
    );
}
