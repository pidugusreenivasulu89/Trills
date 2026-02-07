import { Platform } from 'react-native';

const getBaseUrl = () => {
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
