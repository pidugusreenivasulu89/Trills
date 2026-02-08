import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Share, TextInput, Alert } from 'react-native';
import { Heart, MessageCircle, Share2, Star, UserPlus, Zap, Check, CheckCircle, MoreVertical } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedScreen({ navigation }) {
    const [posts, setPosts] = useState([
        { id: 1, type: 'post', user: 'Alex Rivera', email: 'alex@trills.com', avatar: 'https://i.pravatar.cc/150?u=alex', content: 'Just booked a desk at Nexus Co-working. The atmosphere here is 10/10! ☕️💻', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1000', likes: 24, liked: false, comments: 3 },
        { id: 4, type: 'post', user: 'Sophia Miller', email: 'sophia@trills.com', avatar: 'https://i.pravatar.cc/150?u=sophia', content: 'Found this amazing hidden gem for brunch! 🥑🥪', image: 'https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=80&w=1000', likes: 89, liked: false, comments: 12 },
        {
            id: 'promo1',
            type: 'promo',
            title: 'Zenith Hub',
            category: 'Team Space',
            image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1000',
            discount: '20% OFF',
            description: 'Focused quiet zones and collaborative pods for high-performance teams.'
        },
        { id: 2, type: 'post', user: 'Sarah Jenkins', email: 'sarah@trills.com', avatar: 'https://i.pravatar.cc/150?u=sarah', content: 'Lovely evening at Luminary Dining. That sunset view over the city is unbeatable! 🌅🍷', image: 'https://images.unsplash.com/photo-1502301103665-0b95cc738def?auto=format&fit=crop&q=80&w=1000', likes: 42, liked: false, comments: 5 },
        { id: 3, type: 'post', user: 'Marcus Chen', email: 'marcus@trills.com', avatar: 'https://i.pravatar.cc/150?u=marcus', content: 'Anyone heading to the Tech Founders night tomorrow? Looking to connect with some React experts! 🚀', likes: 12, liked: false, comments: 8 }
    ]);

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
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const storedBlocked = await AsyncStorage.getItem('blocked_users');
                if (storedBlocked) setBlockedUsers(JSON.parse(storedBlocked));

                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) setCurrentUser(JSON.parse(storedUser));

                const storedPending = await AsyncStorage.getItem('pending_connections');
                if (storedPending) setSentRequests(new Set(JSON.parse(storedPending)));
            } catch (e) { }
        };
        loadInitialData();

        const unsubscribe = navigation.addListener('focus', loadInitialData);
        return unsubscribe;
    }, [navigation]);

    const handleLike = (id) => {
        setPosts(posts.map(p => {
            if (p.id === id && p.type === 'post') {
                return { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 };
            }
            return p;
        }));
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
                    onPress: () => setPosts(posts.filter(p => p.id !== postId))
                }
            ]
        );
    };

    const startEditing = (post) => {
        setEditingPostId(post.id);
        setEditContent(post.content);
    };

    const handleUpdate = (postId) => {
        if (!editContent.trim()) return;
        setPosts(posts.map(p => {
            if (p.id === postId) {
                return { ...p, content: editContent };
            }
            return p;
        }));
        setEditingPostId(null);
        setEditContent('');
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
                    else if (opt === 'Delete Post') handleDelete(post.id);
                    else if (opt === 'Hide Post') handleHide(post.id);
                    else if (opt === 'Report Post') handleReport(post.id);
                    else if (opt === 'Block ' + post.user) handleBlock(post.user);
                }
            }))
        );
    };

    const handleQuickConnect = async (recipientEmail, userName) => {
        try {
            if (sentRequests.has(recipientEmail)) return;

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
            const storedPending = await AsyncStorage.getItem('pending_connections');
            const pendingList = storedPending ? JSON.parse(storedPending) : [];
            if (!pendingList.includes(recipientEmail)) {
                pendingList.push(recipientEmail);
                await AsyncStorage.setItem('pending_connections', JSON.stringify(pendingList));
            }

            setSentRequests(prev => new Set([...prev, recipientEmail]));
            Alert.alert('Success', `Connection request sent to ${userName}!`);
        } catch (error) {
            console.log('Connect error:', error);
            // Fallback
            setSentRequests(prev => new Set([...prev, recipientEmail]));
            Alert.alert('Request Sent', `Connection request sent to ${userName}! (Demo Mode)`);
        }
    };

    const visiblePosts = posts.filter(p => !hiddenPostIds.includes(p.id) && !blockedUsers.includes(p.user));

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Community Feed</Text>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
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
                                    style={[styles.followBtn, sentRequests.has(pro.email) && styles.sentBtn]}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleQuickConnect(pro.email, pro.name);
                                    }}
                                >
                                    {sentRequests.has(pro.email) ? (
                                        <Check size={14} color="#4B184C" />
                                    ) : (
                                        <UserPlus size={14} color="#fff" />
                                    )}
                                    <Text style={[styles.followText, sentRequests.has(pro.email) && styles.sentText]}>
                                        {sentRequests.has(pro.email) ? 'Sent' : 'Connect'}
                                    </Text>
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {visiblePosts.map(post => {
                    if (post.type === 'promo') {
                        return (
                            <View key={post.id} style={styles.promoCardContainer}>
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
                        <View key={post.id} style={styles.card}>
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
                                        <Text style={styles.timestamp}>2 hours ago</Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <TouchableOpacity
                                        style={[styles.connectBtnSmall, sentRequests.has(post.email) && styles.sentBtnSmall]}
                                        onPress={() => handleQuickConnect(post.email, post.user)}
                                    >
                                        {sentRequests.has(post.email) ? (
                                            <Check size={16} color="#4B184C" />
                                        ) : (
                                            <UserPlus size={16} color="#4B184C" />
                                        )}
                                        <Text style={styles.connectBtnText}>
                                            {sentRequests.has(post.email) ? 'Sent' : 'Connect'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => showMoreOptions(post)}>
                                        <MoreVertical size={22} color="#64748b" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {editingPostId === post.id ? (
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
                                        <TouchableOpacity onPress={() => handleUpdate(post.id)} style={styles.saveBtn}>
                                            <Text style={styles.saveText}>Save Changes</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <Text style={styles.content}>{post.content}</Text>
                            )}

                            {post.image && <Image source={{ uri: post.image }} style={styles.postImg} />}

                            <View style={styles.actions}>
                                <TouchableOpacity onPress={() => handleLike(post.id)} style={styles.actionBtn}>
                                    <Heart size={20} color={post.liked ? "#4B184C" : "#64748b"} fill={post.liked ? "#4B184C" : "none"} />
                                    <Text style={[styles.actionNum, post.liked && { color: "#4B184C" }]}>{post.likes}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('Comments', { postId: post.id, user: post.user, content: post.content })}
                                    style={styles.actionBtn}
                                >
                                    <MessageCircle size={20} color={post.comments > 0 ? "#4B184C" : "#64748b"} fill={post.comments > 0 ? "rgba(75, 24, 76, 0.1)" : "none"} />
                                    <Text style={[styles.actionNum, post.comments > 0 && { color: "#4B184C" }]}>{post.comments}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleShare(post.content)} style={styles.actionBtn}>
                                    <Share2 size={20} color="#64748b" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    title: { fontSize: 24, fontWeight: '900', color: '#1e293b' },

    // Recommended Pros
    recSection: { paddingVertical: 20, backgroundColor: '#fff', marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 15, alignItems: 'center' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
    viewAll: { color: '#4B184C', fontWeight: '700', fontSize: 13 },
    recList: { paddingLeft: 20, paddingRight: 10 },
    proCard: { width: 140, backgroundColor: '#fff', padding: 15, borderRadius: 20, marginRight: 15, alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
    proAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 10 },
    proName: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginBottom: 2 },
    proRole: { fontSize: 10, color: '#64748b', marginBottom: 12, textAlign: 'center' },
    followBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#4B184C', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    followText: { color: '#fff', fontSize: 12, fontWeight: '700' },
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

    connectBtnSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15, backgroundColor: '#fdf4ff', borderWidth: 1, borderColor: '#fbcfe8' },
    connectBtnText: { fontSize: 12, fontWeight: '700', color: '#4B184C' },
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
});
