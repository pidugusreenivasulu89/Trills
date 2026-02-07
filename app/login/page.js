'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from "next-auth/react";
import './login.css';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authProvider, setAuthProvider] = useState('');
    const [hoveredButton, setHoveredButton] = useState(null);

    const handleSocialLogin = async (platform) => {
        setIsAuthenticating(true);
        setAuthProvider(platform);

        try {
            await signIn(platform.toLowerCase(), {
                callbackUrl: '/feed',
                redirect: true
            });
        } catch (error) {
            console.error(`${platform} login error:`, error);
            setIsAuthenticating(false);
        }
    };

    if (isAuthenticating) {
        return (
            <div className="login-container">
                <div className="auth-loading">
                    <div className="loading-icon">
                        <div className="spinner"></div>
                        <div className="provider-initial">{authProvider.charAt(0)}</div>
                    </div>
                    <h2 className="title-font loading-title">Connecting to {authProvider}</h2>
                    <p className="loading-subtitle">Securely authenticating your account...</p>
                    <div className="progress-bar">
                        <div className="progress-fill"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container">
            {/* Animated background elements */}
            <div className="bg-gradient-orb orb-1"></div>
            <div className="bg-gradient-orb orb-2"></div>
            <div className="bg-gradient-orb orb-3"></div>

            <div className="login-card">
                {/* Logo and branding */}
                <div className="brand-section">
                    <div className="logo-container">
                        <div className="logo-icon">
                            <img src="/logo.png" alt="Trills Logo" className="logo-img" />
                            <div className="logo-glow"></div>
                        </div>
                    </div>
                    <h1 className="title-font welcome-title">Welcome to Trills</h1>
                    <p className="welcome-subtitle">Connect, share, and discover amazing experiences</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-alert" style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        <strong>Login Failed:</strong> {
                            error === 'OAuthSignin' ? 'Could not reach the authentication provider.' :
                                error === 'OAuthCallback' ? 'Problem returning from the provider.' :
                                    error === 'OAuthCreateAccount' ? 'Could not create your account in our database.' :
                                        error === 'Callback' ? 'Problem with the sign in process.' :
                                            error === 'AccessDenied' ? 'Login was canceled or denied.' :
                                                'An unexpected error occurred. Please try again.'
                        }
                        <br />
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Error code: {error}</span>
                    </div>
                )}

                {/* Social login buttons */}
                <div className="social-buttons">
                    <button
                        onClick={() => handleSocialLogin('Google')}
                        className={`social-btn google-btn ${hoveredButton === 'google' ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredButton('google')}
                        onMouseLeave={() => setHoveredButton(null)}
                    >
                        <div className="btn-content">
                            <svg className="social-icon" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="btn-text">Continue with Google</span>
                        </div>
                        <div className="btn-shine"></div>
                    </button>

                    <button
                        onClick={() => handleSocialLogin('Facebook')}
                        className={`social-btn facebook-btn ${hoveredButton === 'facebook' ? 'hovered' : ''}`}
                        onMouseEnter={() => setHoveredButton('facebook')}
                        onMouseLeave={() => setHoveredButton(null)}
                    >
                        <div className="btn-content">
                            <svg className="social-icon" viewBox="0 0 24 24" fill="#1877F2">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            <span className="btn-text">Continue with Facebook</span>
                        </div>
                        <div className="btn-shine"></div>
                    </button>
                </div>

                {/* Divider */}
                <div className="divider">
                    <div className="divider-line"></div>
                    <span className="divider-text">or</span>
                    <div className="divider-line"></div>
                </div>

                {/* Email Login Form */}
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const email = e.target.email.value;
                        const password = e.target.password.value;
                        setIsAuthenticating(true);
                        setAuthProvider('Email');

                        try {
                            const res = await fetch('/api/users/login', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password })
                            });

                            const data = await res.json();
                            if (res.ok && data.user) {
                                // Important: Store user data in localStorage so Navbar can pick it up
                                const profile = {
                                    name: data.user.name,
                                    email: data.user.email,
                                    avatar: data.user.image,
                                    designation: data.user.designation || 'Member',
                                    location: data.user.location || 'Earth',
                                    verified: data.user.verified || false,
                                    bio: 'A passionate professional exploring the intersection of technology and lifestyle.',
                                    banner: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=1000'
                                };
                                localStorage.setItem('user_profile', JSON.stringify(profile));
                                window.dispatchEvent(new Event('userLogin'));
                                router.push('/feed');
                            } else {
                                alert(data.error || 'Login failed');
                                setIsAuthenticating(false);
                            }
                        } catch (err) {
                            console.error('Login error:', err);
                            alert('An error occurred. Please try again.');
                            setIsAuthenticating(false);
                        }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}
                >
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        style={{ padding: '14px 20px', borderRadius: '12px', background: 'rgba(75, 24, 76, 0.03)', border: '1px solid rgba(75, 24, 76, 0.12)', color: 'var(--text-main)', outline: 'none' }}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        style={{ padding: '14px 20px', borderRadius: '12px', background: 'rgba(75, 24, 76, 0.03)', border: '1px solid rgba(75, 24, 76, 0.12)', color: 'var(--text-main)', outline: 'none' }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '14px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Sign In with Email
                    </button>
                </form>

                {/* Footer links */}
                <div className="login-footer">
                    <p className="footer-text">
                        New to Trills?
                        <a href="/register" className="footer-link">Create an account</a>
                    </p>
                    <a href="/admin/login" className="admin-link">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Admin Portal
                    </a>
                </div>

                {/* Trust indicators */}
                <div className="trust-badges">
                    <div className="trust-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                        <span>Secure Login</span>
                    </div>
                    <div className="trust-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                        <span>Privacy Protected</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="login-container"><div className="spinner"></div></div>}>
            <LoginContent />
        </Suspense>
    );
}
