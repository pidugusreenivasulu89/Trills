import React, { useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Send } from 'lucide-react-native';

export default function ChatScreen({ route }) {
    const recipient = route.params?.recipient || {};
    const storageKey = `chat:${recipient.email || recipient.name || 'unknown'}`;
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => { AsyncStorage.getItem(storageKey).then(value => setMessages(value ? JSON.parse(value) : [])); }, [storageKey]);

    const sendMessage = async () => {
        const body = text.trim();
        if (!body) return;
        const next = [...messages, { id: Date.now().toString(), body, mine: true, createdAt: new Date().toISOString() }];
        setMessages(next); setText(''); await AsyncStorage.setItem(storageKey, JSON.stringify(next));
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
                <FlatList data={messages} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<Text style={styles.empty}>Start a conversation with {recipient.name || 'your connection'}.</Text>} renderItem={({ item }) => <View style={[styles.bubble, item.mine && styles.mine]}><Text style={[styles.body, item.mine && styles.mineText]}>{item.body}</Text></View>} />
                <View style={styles.composer}><TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Write a message..." multiline /><TouchableOpacity style={styles.send} onPress={sendMessage}><Send size={20} color="#fff" /></TouchableOpacity></View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: '#fff' }, list: { padding: 18, flexGrow: 1 }, empty: { color: '#64748b', textAlign: 'center', marginTop: 50 }, bubble: { alignSelf: 'flex-start', maxWidth: '80%', backgroundColor: '#f1f5f9', borderRadius: 18, padding: 12, marginBottom: 10 }, mine: { alignSelf: 'flex-end', backgroundColor: '#4B184C' }, body: { color: '#1e293b', lineHeight: 20 }, mineText: { color: '#fff' }, composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: '#e2e8f0', gap: 10 }, input: { flex: 1, maxHeight: 110, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 }, send: { backgroundColor: '#4B184C', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' } });
