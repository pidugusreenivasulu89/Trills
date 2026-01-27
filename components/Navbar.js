'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from "next-auth/react";
import { usePathname } from 'next/navigation';
import { notifications } from '@/lib/data';
import NotificationCenter from './NotificationCenter';
import { Home, Compass, Calendar, Layout, Bell, LogOut, User, CheckCircle } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [showNotifs, setShowNotifs] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const { data: session } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, []);

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user_profile');

            if (session?.user) {
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);

                    // If stored user matches session email OR hasn't been assigned an email yet
                    if (!parsed.email || parsed.email === session.user.email) {
                        // If it has no email, assign the current session email to "claim" this local profile
                        if (!parsed.email) {
                            parsed.email = session.user.email;
                            localStorage.setItem('user_profile', JSON.stringify(parsed));
                        }
                        setUser(parsed);
                        return;
                    }
                }

                // Initialize from session if no matching stored profile
                const profile = {
                    name: session.user.name,
                    email: session.user.email,
                    avatar: session.user.image,
                    designation: 'Member',
                    location: 'Earth',
                    bio: 'A passionate professional exploring the intersection of technology and lifestyle.',
                    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000'
                };
                localStorage.setItem('user_profile', JSON.stringify(profile));
                setUser(profile);
            } else {
                // No session, just check localStorage
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    setUser(null);
                }
            }
        };

        const updateCount = () => {
            // Add a small delay to ensure the notifications array has been updated
            setTimeout(() => {
                setUnreadCount(notifications.filter(n => !n.read).length);
            }, 50);
        };

        checkUser();
        updateCount();
        window.addEventListener('storage', checkUser);
        window.addEventListener('userLogin', checkUser);
        window.addEventListener('notificationsRead', updateCount);

        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('userLogin', checkUser);
            window.removeEventListener('notificationsRead', updateCount);
        };
    }, [session, pathname]);

    const handleLogout = () => {
        localStorage.removeItem('user_profile');
        setUser(null);
        signOut({ callbackUrl: '/login' });
    };

    return (
        <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 2000, margin: '20px', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(12px) saturate(180%)', WebkitBackdropFilter: 'blur(12px) saturate(180%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                    <img src="/logo.png" alt="Trills Logo" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
                    <span className="title-font" style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-1px' }}>Trills</span>
                </a>
            </div>

            <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                <a href="/" style={{ color: pathname === '/' ? 'var(--primary)' : 'var(--text-main)', textDecoration: 'none', fontWeight: pathname === '/' ? '600' : '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'var(--transition)' }}>
                    <Home size={18} /> Home
                </a>
                <a href="/explore" style={{ color: pathname === '/explore' ? 'var(--primary)' : 'var(--text-main)', textDecoration: 'none', fontWeight: pathname === '/explore' ? '600' : '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'var(--transition)' }}>
                    <Compass size={18} /> Explore
                </a>
                <a href="/events" style={{ color: pathname === '/events' ? 'var(--primary)' : 'var(--text-main)', textDecoration: 'none', fontWeight: pathname === '/events' ? '600' : '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'var(--transition)' }}>
                    <Calendar size={18} /> Events
                </a>
                <a href="/feed" style={{ color: pathname === '/feed' ? 'var(--primary)' : 'var(--text-main)', textDecoration: 'none', fontWeight: pathname === '/feed' ? '600' : '500', display: 'flex', alignItems: 'center', gap: '8px', transition: 'var(--transition)' }}>
                    <Layout size={18} /> Feed
                </a>

                {/* Notification Bell - Only show if logged in */}
                {user && (
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => {
                                setShowNotifs(!showNotifs);
                                if (!showNotifs) {
                                    // When opening, immediately clear the count
                                    setTimeout(() => setUnreadCount(0), 100);
                                }
                            }}
                            style={{ background: 'none', border: 'none', color: unreadCount > 0 ? 'var(--accent)' : 'var(--text-main)', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                        >
                            <Bell size={22} fill={unreadCount > 0 ? 'currentColor' : 'none'} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--accent)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifs && <NotificationCenter onClose={() => setShowNotifs(false)} />}
                    </div>
                )}

                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <a href="/profile" style={{ display: 'flex', alignItems: 'center', gap: '15px', textDecoration: 'none', color: 'inherit', transition: '0.2s' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                <span style={{ fontSize: '0.9rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    Hi, {user.name.split(' ')[0]}
                                    {user.verified && <CheckCircle size={14} fill="#4B184C" color="white" />}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user.designation}</span>
                            </div>
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                            ) : (
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {user.name.charAt(0)}
                                </div>
                            )}
                        </a>
                        <button
                            onClick={handleLogout}
                            className="btn-outline"
                            style={{
                                padding: '8px 15px',
                                fontSize: '0.8rem',
                                borderColor: 'rgba(244, 63, 94, 0.3)',
                                color: '#fb7185',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <LogOut size={14} /> Logout
                        </button>
                    </div>
                ) : (
                    <a href="/login" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={16} /> Sign In
                    </a>
                )}
            </div>
        </nav>
    );
}
