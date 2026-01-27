import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Shield, Bell, User, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen({ navigation }) {
    const [notifs, setNotifs] = useState(true);
    const [isPublic, setIsPublic] = useState(false);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>
            <ScrollView>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Profile</Text>
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <View style={styles.itemLeft}>
                            <User size={20} color="#64748b" />
                            <Text style={styles.itemText}>Edit Public Profile</Text>
                        </View>
                        <ChevronRight size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Account</Text>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Bell size={20} color="#64748b" />
                            <Text style={styles.itemText}>Notifications</Text>
                        </View>
                        <Switch value={notifs} onValueChange={setNotifs} trackColor={{ true: '#4B184C' }} />
                    </View>
                    <View style={styles.item}>
                        <View style={styles.itemLeft}>
                            <Shield size={20} color="#64748b" />
                            <Text style={styles.itemText}>Public Profile</Text>
                        </View>
                        <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: '#4B184C' }} />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Support</Text>
                    {['Help Center', 'Terms of Service', 'Privacy Policy'].map((t) => (
                        <TouchableOpacity key={t} style={styles.item}>
                            <View style={styles.itemLeft}>
                                <Text style={styles.itemText}>{t}</Text>
                            </View>
                            <ChevronRight size={18} color="#cbd5e1" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.deleteBtn}>
                    <Text style={styles.deleteText}>Delete Account</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 24 },
    title: { fontSize: 24, fontWeight: '800' },
    section: { paddingHorizontal: 24, marginBottom: 30 },
    sectionLabel: { fontSize: 13, textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: 1, marginBottom: 15 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    itemText: { fontSize: 16, color: '#1e293b', fontWeight: '500' },
    deleteBtn: { margin: 24, padding: 18, borderRadius: 15, borderWidth: 1, borderColor: '#fee2e2', alignItems: 'center' },
    deleteText: { color: '#ef4444', fontWeight: '600' }
});
