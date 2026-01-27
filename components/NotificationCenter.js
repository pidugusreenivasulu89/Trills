'use client';

import { useState, useEffect } from 'react';
import { notifications, markNotificationsAsRead } from '@/lib/data';
import { Users, Zap, Flame, Bell, X, Activity, ShieldCheck, CheckCircle } from 'lucide-react';

export default function NotificationCenter({ onClose }) {
    const [notifs, setNotifs] = useState([]);

    useEffect(() => {
        // Show only unread notifications to the user
        const unread = notifications.filter(n => !n.read);
        setNotifs(unread);

        // Mark all as read so they don't appear next time
        markNotificationsAsRead();
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'connection_request': return <Users size={14} color="var(--primary)" />;
            case 'feed_update': return <Zap size={14} color="#fbbf24" />;
            case 'activity': return <Flame size={14} color="var(--accent)" />;
            case 'verification_nudge': return <ShieldCheck size={14} color="#4B184C" />;
            default: return <Bell size={14} />;
        }
    };

    return (
        <div className="glass shadow-lg" style={{
            position: 'absolute',
            top: '70px',
            right: '0',
            width: '350px',
            maxHeight: '450px',
            borderRadius: '20px',
            overflowY: 'auto',
            zIndex: 3000,
            padding: '20px',
            background: 'var(--bg-dark)',
            border: '1px solid var(--border-glass)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="title-font" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="var(--primary)" /> Notifications
                </h3>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {notifs.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>All caught up!</p>
                ) : notifs.map(n => {
                    const content = (
                        <div key={n.id} style={{
                            display: 'flex',
                            gap: '12px',
                            padding: '12px',
                            borderRadius: '12px',
                            background: n.read ? 'rgba(0,0,0,0.02)' : 'rgba(75, 24, 76, 0.08)',
                            border: '1px solid var(--border-glass)',
                            transition: '0.3s',
                            marginBottom: '10px',
                            cursor: n.link ? 'pointer' : 'default'
                        }}>
                            <div style={{ position: 'relative' }}>
                                <img src={n.avatar} alt="User" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                <span style={{ position: 'absolute', bottom: '-5px', right: '-5px', fontSize: '0.8rem', background: 'var(--bg-dark)', borderRadius: '50%', padding: '2px' }}>
                                    {getTypeIcon(n.type)}
                                </span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '4px', color: n.read ? 'var(--text-muted)' : 'var(--text-main)' }}>
                                    {n.userName && (
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', marginRight: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                            {n.userName}
                                            {n.verified && <CheckCircle size={10} fill="#4B184C" color="white" />}
                                        </span>
                                    )}
                                    {n.content}
                                </p>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{n.timestamp}</span>
                            </div>
                        </div>
                    );

                    return n.link ? (
                        <a href={n.link} key={n.id} onClick={onClose} style={{ textDecoration: 'none', color: 'inherit' }}>
                            {content}
                        </a>
                    ) : content;
                })}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '15px' }}>
                <a href="/notifications" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>View all activity</a>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
