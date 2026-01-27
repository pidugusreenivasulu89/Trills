import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Send, X } from 'lucide-react-native';

export default function CommentsScreen({ route, navigation }) {
    const { postId, user, content } = route.params;
    const [comment, setComment] = useState('');
    const [comments, setComments] = useState([
        { id: 1, user: 'Elena', text: 'Totally agree! The ergonomics are great too.', time: '2h ago' },
        { id: 2, user: 'David', text: 'Is it crowded in the afternoons?', time: '1h ago' },
    ]);

    const handleSend = () => {
        if (!comment.trim()) return;
        const newComm = {
            id: Date.now(),
            user: 'Sreenivasulu',
            text: comment,
            time: 'Just now'
        };
        setComments([...comments, newComm]);
        setComment('');
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
