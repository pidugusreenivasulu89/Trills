import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Share, TextInput, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { Heart, MessageCircle, Share2, Star, UserPlus, Zap, Check, CheckCircle, MoreVertical, Plus } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function FeedScreen({ navigation }) {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const recommendedPros = [
        { id: 101, name: 'Elena R.', email: 'elena@trills.com', role: 'Product Manager @ Meta', avatar: 'https://i.pravatar.cc/150?u=elena' },
        { id: 102, name: 'David S.', email: 'david@trills.com', role: 'VC @ a16z', avatar: 'https://i.pravatar.cc/150?u=david' },
        { id: 103, name: 'Jessica K.', email: 'jessica@trills.com', role: 'UX Designer @ Google', avatar: 'https://i.pravatar.cc/150?u=jessica' },
        { id: 104, name: 'Sreeni V', email: 'sreeni@trills.com', role: 'Tech Lead @ Trills', avatar: 'https://i.pravatar.cc/150?u=sreeni' },
        { id: 105, name: 'Priya M.', email: 'priya@trills.com', role: 'Founder @ HealthStack', avatar: 'https://i.pravatar.cc/150?u=priya' },
        { id: 106, name: 'Chris W.', email: 'chris@trills.com', role: 'Software Engineer', avatar: 'https://i.pravatar.cc/150?u=chris' },
    ];

    const [editingPostId, setEditingPostId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [hiddenPostIds, setHiddenPostIds] = useState([]);
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [sentRequests, setSentRequests] = useState(new Set());
    const [acceptedConnections, setAcceptedConnections] = useState(new Set());
    const [currentUser, setCurrentUser] = useState(null);

    const fetchPosts = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const response = await axios.get(ENDPOINTS.POSTS);
            if (response.data) {
                // If the backend is empty, prepend some default ones for UI demonstration
                const fetchedPosts = response.data;
                if (fetchedPosts.length === 0) {
                    setPosts([
                        { id: 'default1', type: 'post', user: 'Alex Rivera', email: 'alex@trills.com', avatar: 'https://i.pravatar.cc/150?u=alex', content: 'Just booked a desk at Nexus Co-working. The atmosphere here is 10/10! ☕️💻', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000', likes: 24, liked: false, comments: 3 },
                        { id: 'default2', type: 'post', user: 'Sophia Miller', email: 'sophia@trills.com', avatar: 'https://i.pravatar.cc/150?u=sophia', content: 'Found this amazing hidden gem for brunch! 🥑🥪', image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=1000', likes: 89, liked: false, comments: 12 },
                    ]);
                } else {
                    setPosts(fetchedPosts);
                }
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
            loadUserData();
        }, [])
    );

    const loadUserData = async () => {
        try {
            const storedBlocked = await AsyncStorage.getItem('blocked_users');
            if (storedBlocked) setBlockedUsers(JSON.parse(storedBlocked));

            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) setCurrentUser(JSON.parse(storedUser));

            const storedPending = await AsyncStorage.getItem('pending_connections');
            if (storedPending) setSentRequests(new Set(JSON.parse(storedPending)));

            const storedAccepted = await AsyncStorage.getItem('accepted_connections');
            if (storedAccepted) {
                setAcceptedConnections(new Set(JSON.parse(storedAccepted).map(conn => conn.email)));
            }
        } catch (e) { }
    };

    const persistPendingConnection = async (recipientEmail) => {
        const storedPending = await AsyncStorage.getItem('pending_connections');
        const pendingList = storedPending ? JSON.parse(storedPending) : [];
        if (!pendingList.includes(recipientEmail)) {
            pendingList.push(recipientEmail);
            await AsyncStorage.setItem('pending_connections', JSON.stringify(pendingList));
        }
    };

    const persistAcceptedConnection = async (recipientEmail, userName, avatar) => {
        const acceptedRaw = await AsyncStorage.getItem('accepted_connections');
        const acceptedList = acceptedRaw ? JSON.parse(acceptedRaw) : [];
        const friend = {
            email: recipientEmail,
            name: userName,
            avatar,
            acceptedAt: new Date().toISOString()
        };
        const nextAccepted = [friend, ...acceptedList.filter(item => item.email !== recipientEmail)];
        await AsyncStorage.setItem('accepted_connections', JSON.stringify(nextAccepted));
        await AsyncStorage.setItem('friend_list', JSON.stringify(nextAccepted));

        const pendingRaw = await AsyncStorage.getItem('pending_connections');
        const pendingList = pendingRaw ? JSON.parse(pendingRaw) : [];
        await AsyncStorage.setItem('pending_connections', JSON.stringify(pendingList.filter(email => email !== recipientEmail)));

        setAcceptedConnections(prev => new Set([...prev, recipientEmail]));
        setSentRequests(prev => {
            const next = new Set(prev);
            next.delete(recipientEmail);
            return next;
        });
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchPosts(false);
    };

    const handleLike = async (id) => {
        setPosts(posts.map(p => {
            if (p._id === id || p.id === id) {
                const isLiked = p.likedBy?.includes(currentUser?.email) || p.liked;
                return {
                    ...p,
                    liked: !isLiked,
                    likes: isLiked ? p.likes - 1 : p.likes + 1,
                    likedBy: isLiked
                        ? (p.likedBy?.filter(e => e !== currentUser?.email) || [])
                        : [...(p.likedBy || []), currentUser?.email]
                };
            }
            return p;
        }));
        // Optional: Call update API
    };

    const handleShare = async (content) => {
        try {
            await Share.share({ message: content });
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleDelete = (postId) => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // If it's a real post from DB
                            await axios.delete(`${ENDPOINTS.POSTS}/${postId}`);
                            setPosts(posts.filter(p => (p._id || p.id) !== postId));
                        } catch (e) {
                            // Fallback for demo posts
                            setPosts(posts.filter(p => (p._id || p.id) !== postId));
                        }
                    }
                }
            ]
        );
    };

    const startEditing = (post) => {
        setEditingPostId(post._id || post.id);
        setEditContent(post.content);
    };

    const handleUpdate = async (postId) => {
        if (!editContent.trim()) return;
        try {
            // Optional: call PUT API here
            setPosts(posts.map(p => {
                if ((p._id || p.id) === postId) {
                    return { ...p, content: editContent };
                }
                return p;
            }));
            setEditingPostId(null);
            setEditContent('');
        } catch (e) { }
    };

    const handleHide = (postId) => {
        setHiddenPostIds([...hiddenPostIds, postId]);
        Alert.alert('Post Hidden', 'You will no longer see this post in your feed.');
    };

    const handleReport = (postId) => {
        Alert.alert(
            'Report Post',
            'Thank you for reporting. Our team will review this post for policy violations.',
            [{ text: 'OK', onPress: () => handleHide(postId) }]
        );
    };

    const handleBlock = async (userName) => {
        Alert.alert(
            'Block User',
            `Are you sure you want to block ${userName}? You will no longer see their posts.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Block',
                    style: 'destructive',
                    onPress: async () => {
                        const newBlocked = [...blockedUsers, userName];
                        setBlockedUsers(newBlocked);
                        await AsyncStorage.setItem('blocked_users', JSON.stringify(newBlocked));
                        Alert.alert('User Blocked', `${userName} has been blocked.`);
                    }
                }
            ]
        );
    };

    const showMoreOptions = (post) => {
        const isOwnPost = post.email === currentUser?.email || post.user === 'Alex Rivera';

        const options = isOwnPost
            ? ['Edit Post', 'Delete Post', 'Cancel']
            : ['Hide Post', 'Report Post', `Block ${post.user}`, 'Cancel'];

        const cancelButtonIndex = options.length - 1;
        const destructiveButtonIndex = isOwnPost ? 1 : 2;

        Alert.alert(
            'Post Options',
            '',
            options.map((opt, idx) => ({
                text: opt,
                style: idx === destructiveButtonIndex ? 'destructive' : (idx === cancelButtonIndex ? 'cancel' : 'default'),
                onPress: () => {
                    if (opt === 'Edit Post') startEditing(post);
                    else if (opt === 'Delete Post') handleDelete(post._id || post.id);
                    else if (opt === 'Hide Post') handleHide(post._id || post.id);
                    else if (opt === 'Report Post') handleReport(post._id || post.id);
                    else if (opt === 'Block ' + post.user) handleBlock(post.user);
                }
            }))
        );
    };

    const handleQuickConnect = async (recipientEmail, userName) => {
        try {
            if (sentRequests.has(recipientEmail) || acceptedConnections.has(recipientEmail)) return;

            const userData = await AsyncStorage.getItem('user');
            if (!userData) {
                Alert.alert('Login Required', 'Please login to connect.');
                return;
            }
            const requester = JSON.parse(userData);

            await axios.post(ENDPOINTS.CONNECTIONS, {
                requesterEmail: requester.email,
                recipientEmail: recipientEmail
            });

            // Add to LOCAL storage
            await persistPendingConnection(recipientEmail);

            setSentRequests(prev => new Set([...prev, recipientEmail]));
            Alert.alert('Success', `Connection request sent to ${userName}!`);
        } catch (error) {
            console.log('Connect error:', error);
            const existingStatus = error?.response?.data?.status;
            if (existingStatus === 'accepted') {
                await persistAcceptedConnection(recipientEmail, userName);
                Alert.alert('Added to network', `${userName} is already in your network.`);
                return;
            }
            if (existingStatus === 'pending') {
                await persistPendingConnection(recipientEmail);
                setSentRequests(prev => new Set([...prev, recipientEmail]));
                Alert.alert('Request Pending', `Connection request already sent to ${userName}.`);
                return;
            }

            // Fallback
            await persistPendingConnection(recipientEmail);
            setSentRequests(prev => new Set([...prev, recipientEmail]));
            Alert.alert('Request Sent', `Connection request sent to ${userName}! (Demo Mode)`);
        }
    };

    const visiblePosts = posts.filter(p => !hiddenPostIds.includes(p._id || p.id) && !blockedUsers.includes(p.user));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Community Feed</Text>
            </View>

            {isLoading && !isRefreshing ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4B184C" />
                    <Text style={styles.loadingText}>Fetching updates...</Text>
                </View>
            ) : (
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#4B184C']} />
                    }
                >
                    {/* Recommended Section */}
                    <View style={styles.recSection}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Recommended For You</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                                <Text style={styles.viewAll}>See All</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recList}>
                            {recommendedPros.map(pro => (
                                (() => {
                                    const isAccepted = acceptedConnections.has(pro.email);
                                    const isPending = sentRequests.has(pro.email);
                                    return (
                                <TouchableOpacity
                                    key={pro.id}
                                    style={styles.proCard}
                                    onPress={() => navigation.navigate('UserProfile', {
                                        user: pro.name,
                                        avatar: pro.avatar,
                                        recipientEmail: pro.email,
                                        role: pro.role
                                    })}
                                >
                                    <Image source={{ uri: pro.avatar }} style={styles.proAvatar} />
                                    <Text style={styles.proName} numberOfLines={1}>{pro.name}</Text>
                                    <Text style={styles.proRole} numberOfLines={1}>{pro.role}</Text>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={[styles.followBtn, (isPending || isAccepted) && styles.sentBtn]}
                                        disabled={isPending || isAccepted}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleQuickConnect(pro.email, pro.name);
                                        }}
                                    >
                                        {(isPending || isAccepted) ? (
                                            <Check size={14} color="#4B184C" />
                                        ) : (
                                            <UserPlus size={14} color="#fff" />
                                        )}
                                        <Text numberOfLines={1} style={[styles.followText, (isPending || isAccepted) && styles.sentText]}>
                                            {isAccepted ? 'Added to network' : isPending ? 'Sent' : 'Connect'}
                                        </Text>
                                    </TouchableOpacity>
                                </TouchableOpacity>
                                    );
                                })()
                            ))}
                        </ScrollView>
                    </View>

                    {visiblePosts.length === 0 && !isLoading && (
                        <View style={styles.emptyContainer}>
                            <MessageCircle size={60} color="#e2e8f0" />
                            <Text style={styles.emptyText}>No posts yet. Be the first to share something!</Text>
                        </View>
                    )}

                    {visiblePosts.map(post => {
                        const pid = post._id || post.id;
                        const isLiked = post.likedBy?.includes(currentUser?.email) || post.liked;

                        if (post.type === 'promo') {
                            return (
                                <View key={pid} style={styles.promoCardContainer}>
                                    <View style={styles.promoBadge}>
                                        <Zap size={14} color="#fff" fill="#fff" />
                                        <Text style={styles.promoBadgeText}>Promoted</Text>
                                    </View>
                                    <Image source={{ uri: post.image }} style={styles.promoImage} />
                                    <View style={styles.promoContent}>
                                        <View style={styles.promoHeader}>
                                            <Text style={styles.promoTitle}>{post.title}</Text>
                                            <View style={styles.offerBadge}><Text style={styles.offerText}>{post.discount}</Text></View>
                                        </View>
                                        <Text style={styles.promoDesc}>{post.description}</Text>
                                        <TouchableOpacity style={styles.promoAction} onPress={() => navigation.navigate('Explore')}>
                                            <Text style={styles.promoActionText}>Claim Offer</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        }

                        return (
                            <View key={pid} style={styles.card}>
                                <View style={styles.postHeaderRow}>
                                    <TouchableOpacity
                                        style={styles.author}
                                        onPress={() => navigation.navigate('UserProfile', {
                                            user: post.user,
                                            avatar: post.avatar,
                                            recipientEmail: post.email
                                        })}
                                    >
                                        <Image
                                            source={{ uri: (post.email === currentUser?.email) ? (currentUser?.avatar || currentUser?.image || post.avatar) : post.avatar }}
                                            style={styles.avatar}
                                        />
                                        <View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                <Text style={styles.name}>{post.user}</Text>
                                                {(post.verified || (post.email === currentUser?.email && currentUser?.verified)) && (
                                                    <CheckCircle size={14} color="#4B184C" fill="#4B184C" />
                                                )}
                                            </View>
                                            <Text style={styles.timestamp}>
                                                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>

                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        {post.email !== currentUser?.email && (
                                            <TouchableOpacity
                                                style={[styles.connectBtnSmall, (sentRequests.has(post.email) || acceptedConnections.has(post.email)) && styles.sentBtnSmall]}
                                                disabled={sentRequests.has(post.email) || acceptedConnections.has(post.email)}
                                                onPress={() => handleQuickConnect(post.email, post.user)}
                                            >
                                                {(sentRequests.has(post.email) || acceptedConnections.has(post.email)) ? (
                                                    <Check size={16} color="#4B184C" />
                                                ) : (
                                                    <UserPlus size={16} color="#4B184C" />
                                                )}
                                                <Text numberOfLines={1} style={styles.connectBtnText}>
                                                    {acceptedConnections.has(post.email) ? 'Added to network' : sentRequests.has(post.email) ? 'Sent' : 'Connect'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => showMoreOptions(post)}>
                                            <MoreVertical size={22} color="#64748b" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {editingPostId === pid ? (
                                    <View style={styles.editSection}>
                                        <TextInput
                                            style={styles.editInput}
                                            value={editContent}
                                            onChangeText={setEditContent}
                                            multiline
                                            autoFocus
                                        />
                                        <View style={styles.editActions}>
                                            <TouchableOpacity onPress={() => setEditingPostId(null)} style={styles.cancelBtn}>
                                                <Text style={styles.cancelText}>Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => handleUpdate(pid)} style={styles.saveBtn}>
                                                <Text style={styles.saveText}>Save Changes</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={styles.content}>{post.content}</Text>
                                )}

                                {post.image && <Image source={{ uri: post.image }} style={styles.postImg} />}

                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => handleLike(pid)} style={styles.actionBtn}>
                                        <Heart size={20} color={isLiked ? "#4B184C" : "#64748b"} fill={isLiked ? "#4B184C" : "none"} />
                                        <Text style={[styles.actionNum, isLiked && { color: "#4B184C" }]}>{post.likes || 0}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('Comments', { postId: pid, user: post.user, content: post.content })}
                                        style={styles.actionBtn}
                                    >
                                        <MessageCircle size={20} color={post.comments > 0 ? "#4B184C" : "#64748b"} fill={post.comments > 0 ? "rgba(75, 24, 76, 0.1)" : "none"} />
                                        <Text style={[styles.actionNum, post.comments > 0 && { color: "#4B184C" }]}>{post.comments || 0}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleShare(post.content)} style={styles.actionBtn}>
                                        <Share2 size={20} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}

            {/* Floating Action Button */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreatePost')}
            >
                <Plus size={30} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: '900', color: '#1e293b' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, color: '#64748b', fontWeight: '600' },
    emptyContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },
    emptyText: { marginTop: 15, color: '#94a3b8', textAlign: 'center', fontSize: 16, lineHeight: 24 },

    // Recommended Pros
    recSection: { paddingVertical: 20, backgroundColor: '#fff', marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    viewAll: { color: '#4B184C', fontWeight: '700', fontSize: 13 },
    recList: { paddingLeft: 20, paddingRight: 10 },
    proCard: { width: 170, backgroundColor: '#fff', padding: 15, borderRadius: 20, marginRight: 15, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
    proAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
    proName: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    proRole: { fontSize: 10, color: '#64748b', marginBottom: 12, textAlign: 'center' },
    followBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#4B184C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    followText: { color: '#fff', fontSize: 12, fontWeight: '700', flexShrink: 1 },
    sentBtn: { backgroundColor: '#fdf4ff', borderWidth: 1, borderColor: '#fbcfe8' },
    sentText: { color: '#4B184C' },

    // Post Card
    card: { backgroundColor: '#fff', marginBottom: 12, padding: 20 },
    postHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    author: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
    name: { fontWeight: '800', fontSize: 16, color: '#1e293b' },
    timestamp: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
    content: { fontSize: 15, color: '#334155', lineHeight: 22, marginBottom: 15 },
    postImg: { width: '100%', height: 250, borderRadius: 20, marginBottom: 10 },
    actions: { flexDirection: 'row', marginTop: 15, alignItems: 'center', gap: 25 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionNum: { color: '#64748b', fontSize: 14, fontWeight: '600' },

    connectBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, backgroundColor: '#fdf4ff', borderWidth: 1, borderColor: '#fbcfe8', maxWidth: 160 },
    connectBtnText: { fontSize: 12, fontWeight: '700', color: '#4B184C', flexShrink: 1 },
    sentBtnSmall: { backgroundColor: '#fdf2f8', borderColor: '#fbcfe8' },

    // Edit Section
    editSection: { marginBottom: 15, padding: 10, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
    editInput: { fontSize: 15, color: '#334155', lineHeight: 22, minHeight: 80, textAlignVertical: 'top', padding: 5 },
    editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
    cancelBtn: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    cancelText: { color: '#64748b', fontWeight: '600' },
    saveBtn: { backgroundColor: '#4B184C', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    saveText: { color: '#fff', fontWeight: 'bold' },

    // Promoted Card
    promoCardContainer: { backgroundColor: '#fff', marginBottom: 12, overflow: 'hidden', position: 'relative' },
    promoBadge: { position: 'absolute', top: 15, left: 15, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(75, 24, 76, 0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 30 },
    promoBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
    promoImage: { width: '100%', height: 220 },
    promoContent: { padding: 20 },
    promoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    promoTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
    offerBadge: { backgroundColor: '#fdf2f8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#fbcfe8' },
    offerText: { color: '#be185d', fontSize: 12, fontWeight: '900' },
    promoDesc: { fontSize: 14, color: '#64748b', lineHeight: 20, marginBottom: 20 },
    promoAction: { backgroundColor: '#4B184C', padding: 15, borderRadius: 12, alignItems: 'center' },
    promoActionText: { color: '#fff', fontSize: 15, fontWeight: '800' },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 25,
        right: 25,
        backgroundColor: '#4B184C',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    }
});
