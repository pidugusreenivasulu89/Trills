import { Platform } from 'react-native';

export const GOOGLE_WEB_CLIENT_ID = '1001936941616-m4m2f9bad6edsppqm7dkjp68rtauk7dc.apps.googleusercontent.com';

let nativeSocialAuth = null;
let googleConfigured = false;

const logGoogleSignInError = (error) => {
    const details = error && typeof error === 'object'
        ? Object.fromEntries(
            Object.getOwnPropertyNames(error).map((key) => [key, error[key]])
        )
        : { value: error };

    console.error('Google Sign-In failed:', {
        ...details,
        code: error?.code,
        message: error?.message,
        stack: error?.stack,
    });
};

export const getNativeSocialAuth = () => {
    if (Platform.OS === 'web') {
        return {};
    }

    if (nativeSocialAuth) {
        return nativeSocialAuth;
    }

    try {
        const googleSignin = require('@react-native-google-signin/google-signin');

        nativeSocialAuth = {
            GoogleSignin: googleSignin.GoogleSignin,
            statusCodes: googleSignin.statusCodes || {},
            LoginManager: null,
            AccessToken: null,
        };
    } catch (error) {
        console.warn('Native social auth modules are unavailable:', error?.message || error);
        nativeSocialAuth = {};
    }

    return nativeSocialAuth;
};

export const configureGoogleSignIn = () => {
    const modules = getNativeSocialAuth();

    if (modules.GoogleSignin && !googleConfigured) {
        modules.GoogleSignin.configure({
            webClientId: GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
        });
        googleConfigured = true;
    }

    return modules;
};

export const signInWithGoogleNative = async () => {
    const { GoogleSignin } = configureGoogleSignIn();

    if (!GoogleSignin) {
        throw new Error('Google login is available in the production mobile app.');
    }

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    try {
        await GoogleSignin.signOut();
    } catch (error) {
        console.warn('Unable to clear previous Google session:', error?.message || error);
    }

    try {
        const userInfo = await GoogleSignin.signIn();
        const tokens = await GoogleSignin.getTokens();

        if (!tokens?.accessToken) {
            throw new Error('Google sign-in did not return an access token.');
        }

        return {
            userInfo,
            tokens,
            accessToken: tokens.accessToken,
            idToken: tokens.idToken || userInfo?.idToken || userInfo?.data?.idToken,
        };
    } catch (error) {
        logGoogleSignInError(error);
        throw error;
    }
};

export const getGoogleSignInErrorMessage = (error, inProgressMessage = 'Sign in already in progress') => {
    const message = String(error?.message || error || '').toLowerCase();

    if (message.includes('cancel') || message.includes('dismiss')) {
        return null;
    }

    if (message.includes('progress')) {
        return inProgressMessage;
    }

    return 'Google sign-in failed. Please try again or use another sign-in method.';
};
