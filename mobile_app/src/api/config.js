import { Platform } from 'react-native';

const getBaseUrl = () => {
    // Set this to true to test against your local server
    const IS_LOCAL = true;

    if (IS_LOCAL) {
        // For Android Emulator, use 10.0.2.2. For iOS/Real Device, use your computer's IP.
        return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
    }

    // Live Production API URL
    return 'https://www.trills.in/api';
};

export const API_BASE_URL = getBaseUrl();

export const ENDPOINTS = {
    VENUES: `${API_BASE_URL}/venues`,
    USER_BY_EMAIL: `${API_BASE_URL}/users`,
    EVENTS: `${API_BASE_URL}/events`,
    BOOKINGS: `${API_BASE_URL}/bookings`,
    NOTIFICATIONS: `${API_BASE_URL}/notifications`,
    VERIFY: `${API_BASE_URL}/verify-face`,
    REVIEWS: `${API_BASE_URL}/ratings`,
    CANCEL_BOOKING: `${API_BASE_URL}/bookings/cancel`,
    CONNECTIONS: `${API_BASE_URL}/connections`,
    PROFILE_UPDATE: `${API_BASE_URL}/users/profile`,
};
