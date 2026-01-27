import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { Shield, Eye, Lock, Bell, ChevronRight } from 'lucide-react-native';

export default function PrivacySettingsScreen() {
    const [privacyStates, setPrivacyStates] = useState({
        profileVisible: true,
        showActivity: true,
        allowTagging: false,
        dataSharing: true,
        marketingCookies: false
    });

    const toggleSwitch = (key) => {
        setPrivacyStates(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const SettingItem = ({ icon: Icon, title, sub, value, onToggle }) => (
        <View style={styles.item}>
            <View style={styles.itemLeft}>
                <View style={styles.iconBox}>
                    <Icon size={20} color="#4B184C" />
                </View>
                <View style={styles.textContent}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemSub}>{sub}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#e2e8f0', true: '#4B184C' }}
                thumbColor="#fff"
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Privacy Settings</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Profile Privacy</Text>
                    <SettingItem
                        icon={Eye}
                        title="Public Profile"
                        sub="Allow anyone to view your professional bio and interests."
                        value={privacyStates.profileVisible}
                        onToggle={() => toggleSwitch('profileVisible')}
                    />
                    <SettingItem
                        icon={Shield}
                        title="Activity Feed"
                        sub="Show your desk bookings and restaurant visits in the community feed."
                        value={privacyStates.showActivity}
                        onToggle={() => toggleSwitch('showActivity')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Safety & Permissions</Text>
                    <SettingItem
                        icon={Lock}
                        title="Mentions & Tagging"
                        sub="Allow other members to tag you in community posts."
                        value={privacyStates.allowTagging}
                        onToggle={() => toggleSwitch('allowTagging')}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Data & Analytics</Text>
                    <SettingItem
                        icon={Bell}
                        title="Usage Data"
                        sub="Help us improve Trills by sharing anonymous usage statistics."
                        value={privacyStates.dataSharing}
                        onToggle={() => toggleSwitch('dataSharing')}
                    />
                </View>

                <TouchableOpacity style={styles.footerLink}>
                    <Text style={styles.footerText}>Read our Full Privacy Policy</Text>
                    <ChevronRight size={16} color="#4B184C" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    content: { padding: 24 },
    section: { marginBottom: 32 },
    sectionLabel: { fontSize: 13, textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: 1, marginBottom: 15 },
    item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
    itemLeft: { flexDirection: 'row', gap: 15, flex: 1, paddingRight: 10 },
    iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(75, 24, 76, 0.05)', alignItems: 'center', justifyContent: 'center' },
    textContent: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
    itemSub: { fontSize: 13, color: '#64748b', lineHeight: 18 },
    footerLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, padding: 20 },
    footerText: { color: '#4B184C', fontWeight: '700', fontSize: 14 }
});
