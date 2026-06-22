import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

export const FACEBOOK_APP_ID = '1667532970748314';
export const FACEBOOK_REDIRECT_URI = 'https://trills.in/auth/facebook/callback';

const FACEBOOK_AUTH_URL = 'https://www.facebook.com/v19.0/dialog/oauth';
const FACEBOOK_SCOPES = ['public_profile', 'email'];
WebBrowser.maybeCompleteAuthSession();

const decodeParam = (value) => decodeURIComponent(value.replace(/\+/g, ' '));

const readParams = (paramsString) => {
    return paramsString
        .split('&')
        .filter(Boolean)
        .reduce((params, pair) => {
            const [rawKey, rawValue = ''] = pair.split('=');
            params[decodeParam(rawKey)] = decodeParam(rawValue);
            return params;
        }, {});
};

const parseParams = (url) => {
    const queryStart = url.indexOf('?');
    const fragmentStart = url.indexOf('#');
    const queryEnd = fragmentStart === -1 ? url.length : fragmentStart;
    const queryString = queryStart === -1 ? '' : url.slice(queryStart + 1, queryEnd);
    const fragmentString = fragmentStart === -1 ? '' : url.slice(fragmentStart + 1);

    return {
        ...readParams(queryString),
        ...readParams(fragmentString),
    };
};

const buildQuery = (params) => {
    return Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
};

export const signInWithFacebook = () => {
    if (Platform.OS === 'web') {
        return Promise.reject(new Error('Facebook login is available in the mobile app.'));
    }

    const params = buildQuery({
        client_id: FACEBOOK_APP_ID,
        redirect_uri: FACEBOOK_REDIRECT_URI,
        response_type: 'token',
        display: 'popup',
        scope: FACEBOOK_SCOPES.join(','),
    });

    return WebBrowser.openAuthSessionAsync(`${FACEBOOK_AUTH_URL}?${params}`, FACEBOOK_REDIRECT_URI)
        .then((result) => {
            if (result.type !== 'success' || !result.url) {
                throw new Error('Facebook sign-in was cancelled.');
            }

            const responseParams = parseParams(result.url);
            const accessToken = responseParams.access_token;
            const error = responseParams.error || responseParams.error_message || responseParams.error_reason;

            if (accessToken) {
                return accessToken;
            }

            if (error) {
                throw new Error(error);
            }

            throw new Error('Facebook sign-in completed without an access token.');
        });
};
