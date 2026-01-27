import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StatusBar,
    Alert
} from 'react-native';
import { UserPlus, Calendar, CheckCircle, Bell, Trash2, Heart, MessageSquare } from 'lucide-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../api/config';

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) return;
            const user = JSON.parse(userData);
            const url = `${ENDPOINTS.NOTIFICATIONS}?email=${user.email}`;
            console.log('Fetching notifications from:', url);
            const response = await axios.get(url, { timeout: 8000 });
            console.log('Notifications received:', response.data.length);

            // Merge with local sent confirmations
            let allNotifs = response.data;
            try {
                const localPending = await AsyncStorage.getItem('pending_connections');
                if (localPending) {
                    const pendingList = JSON.parse(localPending);
                    const localNotifs = pendingList.map((email, idx) => ({
                        id: `local_${idx}`,
                        type: 'friend_request',
                        userName: email.split('@')[0],
                        content: `You sent a connection request to ${email}.`,
                        timestamp: 'Just now',
                        read: true,
                        avatar: `https://i.pravatar.cc/150?u=${email}`,
                        local: true
                    }));
                    allNotifs = [...localNotifs, ...allNotifs];
                }
            } catch (e) { }

            setNotifications(allNotifs);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // On error, try to at least show local ones
            try {
                const localPending = await AsyncStorage.getItem('pending_connections');
                if (localPending) {
                    const pendingList = JSON.parse(localPending);
                    setNotifications(pendingList.map((email, idx) => ({
                        id: `local_${idx}`,
                        type: 'friend_request',
                        userName: email.split('@')[0],
                        content: `You sent a connection request to ${email} (Local Only).`,
                        timestamp: 'Just now',
                        read: true,
                        avatar: `https://i.pravatar.cc/150?u=${email}`,
                        local: true
                    })));
                }
            } catch (e) { }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const unsubscribe = navigation.addListener('focus', () => {
            fetchNotifications();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'match':
            case 'friend_request':
                return <UserPlus color="#C026D3" size={22} />;
            case 'booking':
            case 'venue':
                return <Calendar color="#4B184C" size={22} />;
            case 'accepted':
                return <CheckCircle color="#10B981" size={22} />;
            case 'crush':
            case 'heart':
                return <Heart color="#E11D48" size={22} fill="#E11D48" />;
            case 'friend_request_sent':
                return <CheckCircle color="#10B981" size={22} />;
            case 'comment':
                return <MessageSquare color="#3B82F6" size={22} />;
            default:
                return <Bell color="#64748B" size={22} />;
        }
    };

    const handleAction = async (notif, status) => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (!userData) return;
            const currentUser = JSON.parse(userData);

            if (notif.type === 'friend_request' && notif.senderEmail) {
                await axios.patch(ENDPOINTS.CONNECTIONS, {
                    requesterEmail: notif.senderEmail,
                    recipientEmail: currentUser.email,
                    status: status // 'accepted' or 'rejected'
                });

                // Update local UI
                setNotifications(notifications.map(n =>
                    n._id === notif._id ? { ...n, read: true, content: `You ${status} the connection request.` } : n
                ));

                if (status === 'accepted') {
                    Alert.alert('Success', 'Connection accepted!');
                }
            }
        } catch (error) {
            console.error('Error handling notification action:', error);
            Alert.alert('Error', 'Failed to process request.');
        }
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity style={[styles.notifItem, !item.read && styles.unreadItem]}>
            <View style={styles.iconWrapper}>
                <View style={styles.iconCircle}>
                    {getIcon(item.type)}
                </View>
                {!item.read && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.content}>
                <View style={styles.notifHeader}>
                    <Text style={styles.userName}>{item.userName || 'System'}</Text>
                    <Text style={styles.time}>{item.timestamp || 'Just now'}</Text>
                </View>
                <Text style={styles.notifContent} numberOfLines={2}>
                    {item.content}
                </Text>

                {(item.type === 'friend_request' || item.type === 'match') && !item.local && item.content.includes('sent you') && (
                    <View style={styles.actionButtons}>
                        <TouchableOpacity
                            style={styles.acceptBtn}
                            onPress={() => handleAction(item, 'accepted')}
                        >
                            <Text style={styles.acceptBtnText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.declineBtn}
                            onPress={() => handleAction(item, 'rejected')}
                        >
                            <Text style={styles.declineBtnText}>Decline</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#4B184C" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Inbox</Text>
                    <Text style={styles.headerSubtitle}>Stay updated on your connections</Text>
                </View>
                <TouchableOpacity style={styles.clearBtn}>
                    <Trash2 color="#64748B" size={20} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item._id || item.id}
                renderItem={renderNotification}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4B184C']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Bell color="#CBD5E1" size={80} strokeWidth={1} />
                        <Text style={styles.emptyTitle}>No notifications yet</Text>
                        <Text style={styles.emptySubtitle}>We'll notify you when something important happens.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 4,
    },
    listContent: {
        flexGrow: 1,
    },
    notifItem: {
        flexDirection: 'row',
        padding: 16,
        paddingHorizontal: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    unreadItem: {
        backgroundColor: '#FDF4FF', // Light purple for unread
    },
    iconWrapper: {
        position: 'relative',
    },
    iconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    unreadDot: {
        position: 'absolute',
        top: 2,
        right: 18,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#C026D3',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    notifHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    time: {
        fontSize: 12,
        color: '#94A3B8',
    },
    notifContent: {
        fontSize: 14,
        color: '#475569',
        lineHeight: 20,
    },
    actionButtons: {
        flexDirection: 'row',
        marginTop: 12,
        gap: 10,
    },
    acceptBtn: {
        backgroundColor: '#4B184C',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    acceptBtnText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    declineBtn: {
        backgroundColor: '#F1F5F9',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    declineBtnText: {
        color: '#475569',
        fontSize: 14,
        fontWeight: '600',
    },
    clearBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAF6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 60,
        paddingTop: 100,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        marginTop: 20,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 22,
    }
});
