'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import './error.css';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (errorCode) => {
        switch (errorCode) {
            case 'Configuration':
                return 'There is a problem with the server configuration. Please check if your environment variables are set correctly.';
            case 'AccessDenied':
                return 'Access was denied. You might not have permission to sign in, or you canceled the sign-in process.';
            case 'Verification':
                return 'The verification token has expired or has already been used.';
            case 'OAuthSignin':
                return 'Error constructing an authorization URL. Please try again later.';
            case 'OAuthCallback':
                return 'Error handling the response from the authentication provider.';
            case 'OAuthCreateAccount':
                return 'Could not create a user account in our database.';
            case 'EmailCreateAccount':
                return 'Could not create a user account with that email.';
            case 'Callback':
                return 'Error in the authentication callback.';
            case 'OAuthAccountNotLinked':
                return 'To confirm your identity, please sign in with the same account you used originally.';
            case 'EmailSignin':
                return 'The e-mail could not be sent.';
            case 'CredentialsSignin':
                return 'The credentials provided were incorrect.';
            case 'SessionRequired':
                return 'Please sign in to access this page.';
            default:
                return 'An unexpected authentication error occurred. Please try again.';
        }
    };

    return (
        <div className="error-container">
            <div className="bg-gradient-orb orb-1"></div>
            <div className="bg-gradient-orb orb-2"></div>

            <div className="error-card">
                <div className="error-icon-wrapper">
                    <div className="error-icon">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                    </div>
                </div>

                <h1 className="error-title">Authentication Error</h1>
                <p className="error-message">
                    {getErrorMessage(error)}
                </p>

                {error && (
                    <div className="error-details">
                        Error Code: {error}
                    </div>
                )}

                <Link href="/login" className="action-button">
                    Return to Login
                </Link>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="error-container">
                <div className="error-card">
                    <div className="spinner"></div>
                    <p>Loading error details...</p>
                </div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    );
}
