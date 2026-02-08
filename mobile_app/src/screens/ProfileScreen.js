import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    Image,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    Shield,
    ChevronRight,
    Settings,
    LogOut,
    Award,
    Star,
    Users,
    Calendar,
    LayoutDashboard
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export default function ProfileScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        connections: 0,
        events: 0,
        vibeScore: 0,
        points: 2450,
        tier: 'Gold'
    });
    const [loading, setLoading] = useState(true);

    const calculateVibeScore = (userData, currentStats) => {
        let score = 50; // Base score
        if (userData.verified) score += 20;
        if (userData.image) score += 10;
        if (userData.phone) score += 10;

        // Simulating activity-based score
        score += Math.min((currentStats?.connections || 0) / 10, 5); // Max +5 from connections
        score += Math.min((currentStats?.events || 0) * 2, 5);     // Max +5 from events

        return Math.min(score, 100);
    };

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);

                // Fetch real connection count
                try {
                    const response = await axios.get(`${ENDPOINTS.CONNECTIONS}?email=${parsedUser.email}`, { timeout: 5000 });
                    let connCount = response.data.count || 0;

                    // Add local pending count
                    try {
                        const localPending = await AsyncStorage.getItem('pending_connections');
                        if (localPending) {
                            const list = JSON.parse(localPending);
                            connCount += list.length;
                        }
                    } catch (e) { }

                    setStats(prev => {
                        const newStats = {
                            ...prev,
                            connections: connCount,
                            points: parsedUser.points || (2450 + (connCount * 10)),
                            tier: parsedUser.tier || 'Silver',
                        };
                        return {
                            ...newStats,
                            vibeScore: calculateVibeScore(parsedUser, newStats)
                        };
                    });
                } catch (err) {
                    console.log('Error fetching connections:', err);

                    // Even on error, show local count
                    let localCount = 124; // Base demo count
                    try {
                        const localPending = await AsyncStorage.getItem('pending_connections');
                        if (localPending) {
                            localCount += JSON.parse(localPending).length;
                        }
                    } catch (e) { }

                    setStats(prev => ({
                        ...prev,
                        connections: localCount,
                        vibeScore: calculateVibeScore(parsedUser, { ...prev, connections: localCount })
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUserData();
        const unsubscribe = navigation.addListener('focus', () => {
            loadUserData();
        });
        return unsubscribe;
    }, [navigation]);

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const menuItems = [
        { label: 'My Bookings', target: 'Bookings', icon: <Calendar size={20} color="#4B184C" /> },
        { label: 'Trills Rewards', target: 'Rewards', icon: <Star size={20} color="#4B184C" /> },
        { label: 'Payment Methods', target: 'Payments', icon: <Star size={20} color="#4B184C" /> },
        { label: 'Privacy Settings', target: 'PrivacySettings', icon: <Shield size={20} color="#4B184C" /> },
    ];

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#4B184C" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>My Profile</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                        <Settings size={24} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                {/* Profile Box */}
                <View style={styles.profileBox}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{ uri: user?.avatar || user?.image || 'https://i.pravatar.cc/150?u=trills' }}
                            style={styles.avatar}
                        />
                        {user?.verified && (
                            <View style={styles.verifiedBadge}>
                                <Shield size={12} color="#fff" fill="#4B184C" />
                            </View>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.name}>{user?.name || 'Sreenivasulu'}</Text>
                        {user?.role === 'admin' && (
                            <View style={styles.adminBadge}>
                                <Text style={styles.adminBadgeText}>ADMIN</Text>
                            </View>
                        )}
                    </View>
                    <View style={styles.tierContainer}>
                        <Award size={14} color="#D4AF37" fill="#D4AF37" />
                        <Text style={styles.tierText}>{stats.tier} Member</Text>
                    </View>
                    <Text style={styles.username}>@{user?.username || 'user'}</Text>
                </View>

                {/* Stats Container */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.connections}</Text>
                        <Text style={styles.statLabel}>Friends</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{stats.points}</Text>
                        <Text style={styles.statLabel}>Miles</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <View style={styles.vibeValueContainer}>
                            <Text style={[styles.statValue, { color: '#C026D3' }]}>{stats.vibeScore}</Text>
                            <Text style={styles.vibePercent}>%</Text>
                        </View>
                        <Text style={styles.statLabel}>Vibe Score</Text>
                    </View>
                </View>

                {!user?.verified && (
                    <TouchableOpacity
                        style={styles.nudgeCard}
                        onPress={() => navigation.navigate('Verification')}
                    >
                        <LinearGradient
                            colors={['#4B184C', '#7B2D7E']}
                            style={styles.nudgeGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Award size={28} color="#fff" />
                            <View style={styles.nudgeContent}>
                                <Text style={styles.nudgeTitle}>Boost your Trust</Text>
                                <Text style={styles.nudgeSub}>Get verified to increase your Vibe Score by 20%.</Text>
                            </View>
                            <ChevronRight size={20} color="#fff" />
                        </LinearGradient>
                    </TouchableOpacity>
                )}

                {/* Menu */}
                <View style={styles.menu}>
                    {user?.role === 'admin' && (
                        <TouchableOpacity
                            style={[styles.menuItem, styles.adminMenuItem]}
                            onPress={() => navigation.navigate('Admin')}
                        >
                            <View style={styles.menuLeft}>
                                <View style={[styles.menuIconBox, { backgroundColor: '#FDF4FF' }]}>
                                    <LayoutDashboard size={20} color="#C026D3" />
                                </View>
                                <Text style={[styles.menuText, { color: '#C026D3' }]}>Admin Dashboard</Text>
                            </View>
                            <ChevronRight size={18} color="#C026D3" />
                        </TouchableOpacity>
                    )}
                    {menuItems.map((item, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={styles.menuItem}
                            onPress={() => item.target && navigation.navigate(item.target)}
                        >
                            <View style={styles.menuLeft}>
                                <View style={styles.menuIconBox}>
                                    {item.icon}
                                </View>
                                <Text style={styles.menuText}>{item.label}</Text>
                            </View>
                            <ChevronRight size={18} color="#CBD5E1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.logout}
                    onPress={handleLogout}
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: 26, fontWeight: '800', color: '#1E293B' },
    profileBox: { alignItems: 'center', marginTop: 10 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 110, height: 110, borderRadius: 55, marginBottom: 16, borderWidth: 3, borderColor: '#F8FAFC' },
    verifiedBadge: { position: 'absolute', bottom: 15, right: 5, backgroundColor: '#4B184C', borderRadius: 10, padding: 2, borderWidth: 2, borderColor: '#FFFFFF' },
    adminBadge: { backgroundColor: '#C026D3', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    adminBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
    tierContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fdf4ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: '#FAE8FF' },
    tierText: { fontSize: 13, fontWeight: '800', color: '#86198f', textTransform: 'uppercase' },
    name: { fontSize: 24, fontWeight: '800', color: '#1E293B', marginTop: 8 },
    username: { fontSize: 14, color: '#64748B', marginTop: 2 },
    statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
    statusText: { fontSize: 13, fontWeight: '700' },

    statsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F8FAFC',
        margin: 24,
        borderRadius: 24,
        paddingVertical: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    statLabel: { fontSize: 12, color: '#64748B', marginTop: 4, fontWeight: '600' },
    statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
    vibeValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
    vibePercent: { fontSize: 12, fontWeight: '800', color: '#C026D3', marginLeft: 1 },

    nudgeCard: { marginHorizontal: 24, marginBottom: 24, borderRadius: 24, overflow: 'hidden', elevation: 5, shadowColor: '#4B184C', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    nudgeGradient: { padding: 20, flexDirection: 'row', alignItems: 'center' },
    nudgeContent: { flex: 1, marginLeft: 15 },
    nudgeTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    nudgeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, lineHeight: 18 },

    menu: { paddingHorizontal: 24 },
    menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    adminMenuItem: { borderBottomColor: '#FDF4FF', paddingVertical: 20 },
    menuIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FDF4FF', alignItems: 'center', justifyContent: 'center' },
    menuText: { fontSize: 16, fontWeight: '700', color: '#334155' },

    logout: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 24, marginTop: 10 },
    logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 16 }
});
