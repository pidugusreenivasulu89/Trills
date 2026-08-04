import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export const USER_STORAGE_KEY = 'user';

const isUsableImage = (value) => typeof value === 'string' && value.trim().length > 0;

export const getStableAvatar = (user = {}) => {
    const candidate = user.customImage || user.image || user.avatar || user.socialImage || user.picture;
    if (isUsableImage(candidate)) return candidate.trim();

    const seed = encodeURIComponent((user.email || user.username || user.name || 'trills-member').toLowerCase().trim());
    return `https://ui-avatars.com/api/?name=${seed}&background=4B184C&color=fff&bold=true&size=256`;
};

export const DESIGNATION_OPTIONS = [
    'Founder / Co-Founder',
    'Chief Executive Officer',
    'Chief Technology Officer',
    'Chief Product Officer',
    'Product Manager',
    'Project Manager',
    'Software Engineer',
    'Frontend Engineer',
    'Backend Engineer',
    'Full Stack Engineer',
    'Mobile App Developer',
    'Data Scientist',
    'AI / ML Engineer',
    'Cloud / DevOps Engineer',
    'Cybersecurity Analyst',
    'UI/UX Designer',
    'Product Designer',
    'Graphic Designer',
    'Digital Marketing Manager',
    'Growth Marketer',
    'Sales Manager',
    'Business Development Manager',
    'Operations Manager',
    'HR Manager',
    'Finance Manager',
    'Consultant',
    'Student',
    'Freelancer',
    'Creator / Influencer',
    'Community Manager',
];

export const normalizeUser = (user = {}) => {
    const image = getStableAvatar(user);
    return {
        ...user,
        image,
        avatar: image,
        photos: Array.isArray(user.photos) ? user.photos.filter(Boolean) : [],
        designation: user.designation || '',
        location: user.location || '',
        bio: user.bio || '',
        profileLocation: user.profileLocation || null,
    };
};

export const isProfileComplete = (user = {}) => {
    const normalized = normalizeUser(user);
    return Boolean(
        normalized.name?.trim()
        && normalized.designation?.trim()
        && normalized.location?.trim()
    );
};

export const saveUserSession = async (user) => {
    const normalized = normalizeUser(user);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalized));
    return normalized;
};

export const syncConnectionCache = async (email) => {
    if (!email) return;

    try {
        const [connectionsRes, sentRes] = await Promise.all([
            axios.get(`${ENDPOINTS.CONNECTIONS}?email=${encodeURIComponent(email)}&type=connections`, { timeout: 8000 }),
            axios.get(`${ENDPOINTS.CONNECTIONS}?email=${encodeURIComponent(email)}&type=sent_requests`, { timeout: 8000 }),
        ]);

        const accepted = Array.isArray(connectionsRes.data)
            ? connectionsRes.data.map(item => item.user).filter(Boolean)
            : [];
        const pending = Array.isArray(sentRes.data)
            ? sentRes.data.map(item => item.recipient?.email).filter(Boolean)
            : [];

        await Promise.all([
            AsyncStorage.setItem('accepted_connections', JSON.stringify(accepted)),
            AsyncStorage.setItem('pending_connections', JSON.stringify([...new Set(pending)])),
        ]);
    } catch (error) {
        // Keep existing cache when the network is unavailable.
    }
};

export const refreshStoredUserProfile = async (user) => {
    const normalized = normalizeUser(user);
    if (!normalized.email) return normalized;

    try {
        const response = await axios.get(`${ENDPOINTS.PROFILE_UPDATE}?email=${encodeURIComponent(normalized.email)}`, { timeout: 8000 });
        const remoteUser = response.data?.user ? response.data.user : {};
        const merged = {
            ...normalized,
            ...remoteUser,
            image: isUsableImage(remoteUser.image) ? remoteUser.image : normalized.image,
            avatar: isUsableImage(remoteUser.avatar) ? remoteUser.avatar : normalized.avatar,
        };
        const savedUser = await saveUserSession(merged);
        await syncConnectionCache(savedUser.email);
        return savedUser;
    } catch (error) {
        const savedUser = await saveUserSession(normalized);
        await syncConnectionCache(savedUser.email);
        return savedUser;
    }
};

export const routeAfterLogin = async (navigation, user, replace = true) => {
    const savedUser = await refreshStoredUserProfile(user);
    const routeName = isProfileComplete(savedUser) ? 'MainTabs' : 'EditProfile';
    const params = routeName === 'EditProfile' ? { required: true } : undefined;

    setTimeout(() => {
        if (replace) navigation.replace(routeName, params);
        else navigation.navigate(routeName, params);
    }, 100);
};
