import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, MessageCircle, UserPlus, MapPin, Grid, List, Check, Lock, UserMinus } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function UserProfileScreen({ navigation, route }) {
    const { user, avatar, role, recipientEmail, location, bio, photos = [] } = route.params || {};
    const [profile, setProfile] = useState({
        name: user,
        avatar,
        designation: role,
        location,
        bio,
        photos,
        email: recipientEmail,
    });
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connectionCount, setConnectionCount] = useState(0);

    useEffect(() => {
        fetchConnectionData();
    }, []);

    const fetchConnectionData = async () => {
        try {
            if (recipientEmail) {
                try {
                    const profileRes = await axios.get(`${ENDPOINTS.PROFILE_UPDATE}?email=${encodeURIComponent(recipientEmail)}`, { timeout: 8000 });
                    const remote = profileRes.data?.user;
                    if (remote) {
                        setProfile(current => ({
                            ...current,
                            ...remote,
                            name: remote.name || current.name,
                            avatar: remote.image || remote.avatar || current.avatar,
                            designation: remote.designation || current.designation,
                            photos: Array.isArray(remote.photos) ? remote.photos : current.photos,
                        }));
                    }
                } catch (profileError) {
                    console.log('Profile fetch failed:', profileError?.message || profileError);
                }

                // Fetch connection count
                const countRes = await axios.get(`${ENDPOINTS.CONNECTIONS}?email=${recipientEmail}`, { timeout: 5000 });
                setConnectionCount(countRes.data.count || 0);

                // Fetch connection status
                const userData = await AsyncStorage.getItem('user');
                if (userData) {
                    const requester = JSON.parse(userData);
                    const statusRes = await axios.get(`${ENDPOINTS.CONNECTIONS}?checkRecipientEmail=${recipientEmail}&requesterEmail=${requester.email}`, { timeout: 5000 });
                    if (statusRes.data.connected) {
                        setIsConnected(true);
                        setConnectionStatus(statusRes.data.status);
                    } else {
                        // Check local override
                        try {
                            const localAccepted = await AsyncStorage.getItem('accepted_connections');
                            if (localAccepted && JSON.parse(localAccepted).some(conn => conn.email === recipientEmail)) {
                                setIsConnected(true);
                                setConnectionStatus('accepted');
                                return;
                            }

                            const localPending = await AsyncStorage.getItem('pending_connections');
                            if (localPending && JSON.parse(localPending).includes(recipientEmail)) {
                                setIsConnected(true);
                                setConnectionStatus('pending');
                            }
                        } catch (e) { }
                    }
                }
            }
        } catch (error) {
            console.log('Error fetching connection data:', error);
            try {
                const localAccepted = await AsyncStorage.getItem('accepted_connections');
                if (localAccepted && JSON.parse(localAccepted).some(conn => conn.email === recipientEmail)) {
                    setIsConnected(true);
                    setConnectionStatus('accepted');
                    return;
                }

                const localPending = await AsyncStorage.getItem('pending_connections');
                if (localPending && JSON.parse(localPending).includes(recipientEmail)) {
                    setIsConnected(true);
                    setConnectionStatus('pending');
                }
            } catch (e) { }
        } finally {
            setLoading(false);
        }
    };

    const [connectionStatus, setConnectionStatus] = useState(null);

    const handleConnect = async () => {
        if (isConnected) return;

        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                Alert.alert('Login Required', 'Please login to connect with other members.');
                return;
            }
            const requester = JSON.parse(userData);

            await axios.post(ENDPOINTS.CONNECTIONS, {
                requesterEmail: requester.email,
                recipientEmail: recipientEmail // Send email directly
            });

            setIsConnected(true);
            setConnectionStatus('pending');
            setConnectionCount(prev => prev + 1);

            // Local sync
            try {
                const storedPending = await AsyncStorage.getItem('pending_connections');
                const pendingList = storedPending ? JSON.parse(storedPending) : [];
                if (!pendingList.includes(recipientEmail)) {
                    pendingList.push(recipientEmail);
                    await AsyncStorage.setItem('pending_connections', JSON.stringify(pendingList));
                }
            } catch (e) { }

            Alert.alert('Success', `Connection request sent to ${profile.name || 'this member'}!`);
        } catch (error) {
            console.log('Connect Error:', error);
            const existingStatus = error?.response?.data?.status;
            if (existingStatus === 'accepted' || existingStatus === 'pending') {
                setIsConnected(true);
                setConnectionStatus(existingStatus);
                if (existingStatus === 'accepted') {
                    try {
                        const acceptedRaw = await AsyncStorage.getItem('accepted_connections');
                        const acceptedList = acceptedRaw ? JSON.parse(acceptedRaw) : [];
                        const connection = {
                            email: recipientEmail,
                            name: profile.name || recipientEmail?.split('@')[0] || 'Connection',
                            avatar: profile.avatar,
                            acceptedAt: new Date().toISOString()
                        };
                        await AsyncStorage.setItem('accepted_connections', JSON.stringify([connection, ...acceptedList.filter(item => item.email !== recipientEmail)]));
                    } catch (e) { }
                }
                Alert.alert(existingStatus === 'accepted' ? 'Already connected' : 'Request pending', existingStatus === 'accepted' ? `${profile.name || 'This member'} is already in your connections.` : `Your request to ${profile.name || 'this member'} is already pending.`);
                return;
            }

            Alert.alert('Could not send request', error?.response?.data?.error || 'Please try again when the profile is available.');
        }
    };

    const handleRemoveConnection = () => {
        Alert.alert('Remove connection?', `Remove ${profile.name || 'this member'} from your connections?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove', style: 'destructive', onPress: async () => {
                    try {
                        const storedUser = await AsyncStorage.getItem('user');
                        const requester = storedUser ? JSON.parse(storedUser) : null;
                        const statusRes = await axios.get(`${ENDPOINTS.CONNECTIONS}?checkRecipientEmail=${recipientEmail}&requesterEmail=${requester?.email}`);
                        if (statusRes.data.connectionId) {
                            await axios.delete(ENDPOINTS.CONNECTIONS, { data: { connectionId: statusRes.data.connectionId, email: requester?.email } });
                        }
                    } catch (error) {
                        console.warn('Remote disconnect failed; clearing local state.', error?.message);
                    }
                    const acceptedRaw = await AsyncStorage.getItem('accepted_connections');
                    const accepted = acceptedRaw ? JSON.parse(acceptedRaw) : [];
                    await AsyncStorage.setItem('accepted_connections', JSON.stringify(accepted.filter(item => item.email !== recipientEmail)));
                    setIsConnected(false); setConnectionStatus(null); setConnectionCount(value => Math.max(0, value - 1));
                }
            }
        ]);
    };

    // Updated stats with real data
    const stats = [
        { label: 'Connections', value: connectionCount },
        { label: 'Events', value: '12' },
        { label: 'Vibe Score', value: '92' },
    ];

    const posts = Array.isArray(profile.photos) ? profile.photos : [];

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#4B184C" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{profile.name || 'Profile'}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: profile.avatar || 'https://i.pravatar.cc/300' }}
                            style={styles.avatar}
                        />
                        <View style={styles.onlineBadge} />
                    </View>

                    <Text style={styles.name}>{profile.name || 'Unknown User'}</Text>
                    <Text style={styles.role}>{profile.designation || 'Community Member'}</Text>

                    <View style={styles.locationContainer}>
                        <MapPin size={14} color="#64748b" />
                        <Text style={styles.location}>{profile.location || 'Location not added'}</Text>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        {stats.map((stat, index) => (
                            <TouchableOpacity key={index} style={styles.statItem} onPress={() => index === 0 && navigation.navigate('Connections', { email: recipientEmail })}>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Actions */}
                    <View style={styles.actions}>
                        <TouchableOpacity
                            style={[styles.actionBtn, styles.primaryBtn, isConnected && styles.connectedBtn]}
                            onPress={connectionStatus === 'accepted' ? handleRemoveConnection : handleConnect}
                            disabled={connectionStatus === 'pending'}
                        >
                            {connectionStatus === 'accepted' ? <UserMinus size={20} color="#4B184C" /> : isConnected ? <Check size={20} color="#4B184C" /> : <UserPlus size={20} color="#fff" />}
                            <Text style={[styles.btnText, isConnected && styles.connectedText]}>
                                {connectionStatus === 'pending' ? 'Request Sent' : connectionStatus === 'accepted' ? 'Remove connection' : 'Connect'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionBtn, styles.secondaryBtn]}
                            onPress={() => navigation.navigate('Chat', { recipient: { name: profile.name, email: recipientEmail, image: profile.avatar } })}
                        >
                            <MessageCircle size={20} color="#4B184C" />
                            <Text style={styles.secondaryBtnText}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {!!profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

                {/* Content Tabs */}
                <View style={styles.contentSection}>
                    <View style={styles.tabs}>
                        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                            <Grid size={20} color="#4B184C" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.tab}>
                            <List size={20} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoScroller}>
                        {(isConnected && connectionStatus === 'accepted') ? (
                            posts.length > 0 ? posts.map((img, index) => (
                                <View key={index} style={styles.photoSlide}>
                                    <Image source={{ uri: img }} style={styles.slideImage} />
                                </View>
                            )) : <View style={styles.privateOverlay}><Text style={styles.privateTitle}>No photos yet</Text><Text style={styles.privateSubtitle}>{profile.name || 'This member'} has not added profile photos.</Text></View>
                        ) : (
                            <View style={styles.privateOverlay}>
                                <View style={styles.blurContainer}>
                                    <View style={styles.lockIconContainer}>
                                        <Lock size={40} color="#94a3b8" />
                                    </View>
                                    <Text style={styles.privateTitle}>Private Profile</Text>
                                    <Text style={styles.privateSubtitle}>
                                        Connect with {profile.name || 'this user'} to see their posts and professional updates.
                                    </Text>
                                    {(!isConnected || connectionStatus !== 'pending') && (
                                        <TouchableOpacity
                                            style={styles.connectNowBtn}
                                            onPress={handleConnect}
                                        >
                                            <Text style={styles.connectNowText}>Connect to View</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    backBtn: {
        padding: 5,
    },
    profileHeader: {
        alignItems: 'center',
        padding: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    onlineBadge: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10b981',
        borderWidth: 2,
        borderColor: '#fff',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 5,
    },
    role: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 10,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 20,
    },
    location: {
        color: '#64748b',
        fontSize: 14,
    },
    bio: { marginHorizontal: 24, marginBottom: 10, color: '#475569', lineHeight: 21, textAlign: 'center' },
    statsContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        paddingVertical: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f1f5f9',
        marginBottom: 20,
    },
    statItem: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1e293b',
    },
    statLabel: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        paddingHorizontal: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    primaryBtn: {
        backgroundColor: '#4B184C',
    },
    connectedBtn: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#4B184C',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    connectedText: {
        color: '#4B184C',
    },
    secondaryBtn: {
        backgroundColor: '#fdf4ff',
        borderWidth: 1,
        borderColor: '#fbcfe8',
    },
    secondaryBtnText: {
        color: '#4B184C',
        fontWeight: 'bold',
        fontSize: 16,
    },
    contentSection: {
        flex: 1,
    },
    tabs: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 40,
        paddingVertical: 15,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#4B184C',
        paddingBottom: 5,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 1,
    },
    gridItem: {
        width: (width - 2) / 3,
        height: (width - 2) / 3,
        marginBottom: 1,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    photoScroller: {
        minWidth: '100%',
    },
    photoSlide: {
        width,
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    slideImage: {
        width: '100%',
        height: 460,
        borderRadius: 28,
        backgroundColor: '#f1f5f9',
    },
    privateOverlay: {
        width: '100%',
        paddingVertical: 60,
        backgroundColor: '#f8fafc',
        alignItems: 'center',
        justifyContent: 'center',
    },
    blurContainer: {
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    lockIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f1f5f9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    privateTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 10,
    },
    privateSubtitle: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    connectNowBtn: {
        backgroundColor: '#4B184C',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    connectNowText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
