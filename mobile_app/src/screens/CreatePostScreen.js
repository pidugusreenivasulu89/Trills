import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert
} from 'react-native';
import { X, Image as ImageIcon, Globe, Smile } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreatePostScreen({ navigation }) {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                setUser(JSON.parse(userData));
            } else {
                Alert.alert('Login Required', 'Please login to post.');
                navigation.goBack();
            }
        };
        loadUser();
    }, []);

    const handlePost = async () => {
        if (!content.trim()) {
            Alert.alert('Error', 'Post content cannot be empty.');
            return;
        }

        try {
            setIsLoading(true);
            const payload = {
                user: user.name || user.email.split('@')[0],
                email: user.email,
                avatar: user.image || user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
                content: content.trim(),
                type: 'post'
            };

            const response = await axios.post(ENDPOINTS.POSTS, payload);

            if (response.status === 201) {
                Alert.alert('Success', 'Post published successfully!');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Post error:', error);
            Alert.alert('Error', 'Failed to publish post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                        <X size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Create Post</Text>
                    <TouchableOpacity
                        onPress={handlePost}
                        disabled={!content.trim() || isLoading}
                        style={[styles.postBtn, (!content.trim() || isLoading) && styles.postBtnDisabled]}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.postBtnText}>Post</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>
                    <View style={styles.userInfo}>
                        <Image
                            source={{ uri: user?.image || user?.avatar || 'https://i.pravatar.cc/150?u=temp' }}
                            style={styles.avatar}
                        />
                        <View>
                            <Text style={styles.userName}>{user?.name || 'User'}</Text>
                            <View style={styles.privacyBadge}>
                                <Globe size={12} color="#64748b" />
                                <Text style={styles.privacyText}>Public</Text>
                            </View>
                        </View>
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="What's on your mind?"
                        placeholderTextColor="#94a3b8"
                        multiline
                        autoFocus
                        value={content}
                        onChangeText={setContent}
                    />
                </View>

                {/* Toolbar */}
                <View style={styles.toolbar}>
                    <TouchableOpacity style={styles.toolItem}>
                        <ImageIcon size={22} color="#4B184C" />
                        <Text style={styles.toolLabel}>Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.toolItem}>
                        <Smile size={22} color="#4B184C" />
                        <Text style={styles.toolLabel}>Feeling</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }} />
                    <Text style={[styles.charCount, content.length > 250 && { color: '#ef4444' }]}>
                        {content.length}/280
                    </Text>
                </View>
            </KeyboardAvoidingView>
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
    closeBtn: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e293b',
    },
    postBtn: {
        backgroundColor: '#4B184C',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    postBtnDisabled: {
        backgroundColor: '#94a3b8',
    },
    postBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    contentContainer: {
        flex: 1,
        padding: 20,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 12,
        backgroundColor: '#f1f5f9',
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1e293b',
    },
    privacyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginTop: 4,
        gap: 4,
    },
    privacyText: {
        fontSize: 11,
        color: '#64748b',
        fontWeight: '600',
    },
    input: {
        fontSize: 18,
        color: '#1e293b',
        lineHeight: 26,
        textAlignVertical: 'top',
        flex: 1,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        gap: 20,
    },
    toolItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    toolLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    charCount: {
        fontSize: 12,
        color: '#94a3b8',
        fontWeight: '500',
    }
});
