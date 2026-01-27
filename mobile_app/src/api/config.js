import { Platform } from 'react-native';

const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        // In browser testing, we always want the local backend on 3000
        return 'http://localhost:3000/api';
    }
    // Fallback for physical devices - ALWAYS check your local IP with ipconfig/ifconfig
    return 'http://192.168.31.29:3000/api';
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
};
