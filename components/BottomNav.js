'use client';

import { useSession } from "next-auth/react";
import { Home, Compass, Calendar, Layout, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', href: '/', icon: <Home size={20} /> },
        { label: 'Explore', href: '/explore', icon: <Compass size={20} /> },
        { label: 'Events', href: '/events', icon: <Calendar size={20} /> },
        { label: 'Feed', href: '/feed', icon: <Layout size={20} /> },
    ];

    return (
        <div className="bottom-nav glass" style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            right: '20px',
            height: '70px',
            zIndex: 2000,
            display: 'none', // Shown only via media query in globals.css
            justifyContent: 'space-around',
            alignItems: 'center',
            borderRadius: '24px',
            padding: '0 10px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid var(--border-glass)',
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px) saturate(180%)'
        }}>
            {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={`nav-item ${pathname === item.href ? 'active' : ''}`}>
                    {item.icon}
                    <span style={{ fontSize: '0.65rem', fontWeight: '600', marginTop: '4px' }}>{item.label}</span>
                </Link>
            ))}

            {session ? (
                <Link href="/profile" className={`nav-item ${pathname === '/profile' ? 'active' : ''}`}>
                    <User size={20} />
                    <span style={{ fontSize: '0.65rem', fontWeight: '600', marginTop: '4px' }}>Profile</span>
                </Link>
            ) : (
                <Link href="/login" className={`nav-item ${pathname === '/login' ? 'active' : ''}`} style={{ color: 'var(--primary)' }}>
                    <LogIn size={20} />
                    <span style={{ fontSize: '0.65rem', fontWeight: '600', marginTop: '4px' }}>Sign In</span>
                </Link>
            )}

            <style jsx>{`
                .nav-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-decoration: none;
                    color: var(--text-muted);
                    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 8px 12px;
                    border-radius: 16px;
                }
                .nav-item.active {
                    color: var(--primary);
                    background: rgba(75, 24, 76, 0.05);
                }
                .nav-item:active {
                    transform: scale(0.9);
                }
            `}</style>
        </div>
    );
}
