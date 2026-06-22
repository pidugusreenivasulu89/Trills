import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { MessageCircle, UserMinus } from 'lucide-react-native';
import { ENDPOINTS } from '../api/config';

export default function ConnectionsScreen({ navigation, route }) {
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);
    const email = route.params?.email;

    const loadConnections = useCallback(async () => {
        setLoading(true);
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const currentUser = storedUser ? JSON.parse(storedUser) : null;
            const profileEmail = email || currentUser?.email;
            const response = await axios.get(`${ENDPOINTS.CONNECTIONS}?email=${encodeURIComponent(profileEmail)}&type=connections`, { timeout: 7000 });
            const remote = Array.isArray(response.data)
                ? response.data
                : (Array.isArray(response.data?.connections) ? response.data.connections : []);

            if (profileEmail === currentUser?.email) {
                await AsyncStorage.setItem('accepted_connections', JSON.stringify(remote.map(item => item.user)));
            }
            setConnections(remote);
        } catch (error) {
            const local = await AsyncStorage.getItem('accepted_connections');
            setConnections((local ? JSON.parse(local) : []).map(user => ({ id: user.id || user.email, user })));
        } finally {
            setLoading(false);
        }
    }, [email]);

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadConnections);
        loadConnections();
        return unsubscribe;
    }, [loadConnections, navigation]);

    const removeConnection = (connection) => {
        Alert.alert('Remove connection?', `Remove ${connection.user.name || 'this member'} from your connections?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: async () => {
                    const storedUser = await AsyncStorage.getItem('user');
                    const currentUser = storedUser ? JSON.parse(storedUser) : null;
                    await axios.delete(ENDPOINTS.CONNECTIONS, { data: { connectionId: connection.id, email: currentUser?.email } });
                    const next = connections.filter(item => item.id !== connection.id);
                    setConnections(next);
                    await AsyncStorage.setItem('accepted_connections', JSON.stringify(next.map(item => item.user)));
                },
            },
        ]);
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#4B184C" /></View>;

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={connections}
                keyExtractor={item => String(item.id || item.user?.email)}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyTitle}>No connections yet</Text><Text style={styles.emptyText}>People you connect with will appear here.</Text></View>}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('UserProfile', {
                        user: item.user.name,
                        avatar: item.user.image || item.user.avatar,
                        role: item.user.designation,
                        recipientEmail: item.user.email,
                        location: item.user.location,
                        bio: item.user.bio,
                        photos: item.user.photos || [],
                    })}>
                        <Image source={{ uri: item.user.image || item.user.avatar || `https://i.pravatar.cc/150?u=${item.user.email}` }} style={styles.avatar} />
                        <View style={styles.info}><Text style={styles.name}>{item.user.name || 'Connection'}</Text><Text style={styles.meta}>{item.user.designation || item.user.location || item.user.email}</Text></View>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Chat', { recipient: item.user })}><MessageCircle size={20} color="#4B184C" /></TouchableOpacity>
                        {!email && <TouchableOpacity style={styles.iconButton} onPress={() => removeConnection(item)}><UserMinus size={20} color="#dc2626" /></TouchableOpacity>}
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    list: { padding: 20, flexGrow: 1 },
    card: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', gap: 12 },
    avatar: { width: 54, height: 54, borderRadius: 27 },
    info: { flex: 1 }, name: { fontSize: 16, fontWeight: '800', color: '#1e293b' }, meta: { color: '#64748b', marginTop: 3 },
    iconButton: { padding: 9, borderRadius: 12, backgroundColor: '#f8fafc' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 }, emptyTitle: { fontSize: 20, fontWeight: '800' }, emptyText: { color: '#64748b', marginTop: 8, textAlign: 'center' },
});
