'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from "next-auth/react";
import { signInWithRedirect } from 'aws-amplify/auth';
import './login.css';

export default function LoginPage() {
    const router = useRouter();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authProvider, setAuthProvider] = useState('');
    const [hoveredButton, setHoveredButton] = useState(null);

    const handleSocialLogin = async (platform) => {
        setIsAuthenticating(true);
        setAuthProvider(platform);

        if (platform === 'Google') {
            try {
                await signInWithRedirect({ provider: 'Google' });
            } catch (error) {
                console.error("Amplify login error:", error);
                setIsAuthenticating(false);
            }
            return;
        }

        const result = await signIn(platform.toLowerCase(), {
            callbackUrl: '/onboarding',
            redirect: true
        });
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

                {/* Footer links */}
                <div className="login-footer">
                    <p className="footer-text">
                        New to Trills?
                        <a href="/onboarding" className="footer-link">Create an account</a>
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
