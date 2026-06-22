import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

const formatTime = (value) => {
    if (!value) return 'Just now';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Just now';
    const diffMinutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60000));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return date.toLocaleDateString();
};

const normalizeComments = (items) => Array.isArray(items)
    ? items.map((item, index) => ({
        id: item.id || item._id || `${index}`,
        user: item.user || item.name || item.email?.split('@')[0] || 'Member',
        text: item.text || '',
        time: item.time || formatTime(item.createdAt),
        createdAt: item.createdAt,
    })).filter(item => item.text)
    : [];

export default function CommentsScreen({ route, navigation }) {
    const { postId, user, content } = route.params;
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState(normalizeComments(route.params?.comments));
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
            } catch (error) { }

            try {
                setLoading(true);
                const response = await axios.get(`${ENDPOINTS.POSTS}/${postId}`, { timeout: 8000 });
                setComments(normalizeComments(response.data?.comments));
            } catch (error) {
                console.log('Unable to load comments:', error?.response?.data || error?.message || error);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [postId]);

    const handleSend = async () => {
        if (!comment.trim()) return;
        const userName = currentUser?.name || currentUser?.email?.split('@')[0] || 'You';
        const newComm = {
            id: Date.now(),
            user: userName,
            text: comment,
            time: 'Just now'
        };
        const text = comment;
        setComments([...comments, newComm]);
        setComment('');

        try {
            if (!currentUser?.email) return;
            const response = await axios.patch(`${ENDPOINTS.POSTS}/${postId}`, {
                action: 'comment',
                text,
                user: {
                    email: currentUser.email,
                    name: currentUser.name,
                    avatar: currentUser.avatar || currentUser.image,
                    verified: currentUser.verified,
                }
            }, { timeout: 8000 });
            setComments(normalizeComments(response.data?.comments));
        } catch (error) {
            console.log('Unable to persist comment:', error?.response?.data || error?.message || error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Comments</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.originalPost}>
                    <Text style={styles.postUser}>{user}</Text>
                    <Text style={styles.postText}>{content}</Text>
                </View>

                <View style={styles.divider} />

                {loading && comments.length === 0 && (
                    <ActivityIndicator color="#4B184C" style={{ marginTop: 20 }} />
                )}

                {comments.map(item => (
                    <View key={item.id} style={styles.commentItem}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentUser}>{item.user}</Text>
                            <Text style={styles.commentTime}>{item.time}</Text>
                        </View>
                        <Text style={styles.commentText}>{item.text}</Text>
                    </View>
                ))}
            </ScrollView>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputArea}>
                    <TextInput
                        style={styles.input}
                        placeholder="Write a comment..."
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
                        <Send size={20} color={comment.trim() ? "#4B184C" : "#cbd5e1"} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    scrollContent: { padding: 20 },
    originalPost: { backgroundColor: '#f8fafc', padding: 15, borderRadius: 12, marginBottom: 20 },
    postUser: { fontWeight: '700', fontSize: 14, color: '#4B184C', marginBottom: 5 },
    postText: { fontSize: 15, color: '#334155', lineHeight: 22 },
    divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },
    commentItem: { marginBottom: 20 },
    commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    commentUser: { fontWeight: '700', fontSize: 14, color: '#1e293b' },
    commentTime: { fontSize: 12, color: '#94a3b8' },
    commentText: { fontSize: 14, color: '#4b5563', lineHeight: 20 },
    inputArea: { flexDirection: 'row', padding: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'center' },
    input: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, minHeight: 40, maxHeight: 100, fontSize: 15 },
    sendBtn: { marginLeft: 10, padding: 5 }
});
