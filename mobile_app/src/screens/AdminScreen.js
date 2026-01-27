import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Alert,
    Dimensions,
    StatusBar
} from 'react-native';
import {
    LayoutDashboard,
    Users,
    MapPin,
    CheckCircle,
    XCircle,
    TrendingUp,
    ArrowLeft,
    PlusCircle,
    Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function AdminScreen({ navigation }) {
    const [stats, setStats] = useState({
        activeUsers: '1.2k',
        pendingVerifications: 8,
        totalVenues: 24,
        revenue: '₹45,000'
    });

    const [pendingRequests, setPendingRequests] = useState([
        { id: '1', name: 'Rahul Varma', time: '10 min ago', status: 'pending' },
        { id: '2', name: 'Sneha Kapur', time: '25 min ago', status: 'pending' },
        { id: '3', name: 'Vikram Singh', time: '1 hr ago', status: 'pending' },
    ]);

    const handleAction = (id, action) => {
        Alert.alert(
            action === 'approve' ? 'Approve User' : 'Reject User',
            `Are you sure you want to ${action} this verification request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => {
                        setPendingRequests(prev => prev.filter(req => req.id !== id));
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mobile Admin</Text>
                <TouchableOpacity style={styles.infoBtn}>
                    <Info size={22} color="#1E293B" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Stats Overview */}
                <View style={styles.statsGrid}>
                    <StatCard label="Live Users" value={stats.activeUsers} icon={<Users size={18} color="#4B184C" />} />
                    <StatCard label="Venues" value={stats.totalVenues} icon={<MapPin size={18} color="#C026D3" />} />
                    <StatCard label="Pending" value={stats.pendingVerifications} icon={<CheckCircle size={18} color="#F59E0B" />} />
                    <StatCard label="Revenue" value={stats.revenue} icon={<TrendingUp size={18} color="#10B981" />} />
                </View>

                {/* Verification Queue */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Verification Queue</Text>
                        <Text style={styles.badge}>{pendingRequests.length}</Text>
                    </View>

                    {pendingRequests.map((item) => (
                        <View key={item.id} style={styles.requestItem}>
                            <View style={styles.requestInfo}>
                                <Text style={styles.requestName}>{item.name}</Text>
                                <Text style={styles.requestTime}>{item.time}</Text>
                            </View>
                            <View style={styles.requestActions}>
                                <TouchableOpacity
                                    style={[styles.miniBtn, styles.approveBtn]}
                                    onPress={() => handleAction(item.id, 'approve')}
                                >
                                    <CheckCircle size={18} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.miniBtn, styles.rejectBtn]}
                                    onPress={() => handleAction(item.id, 'reject')}
                                >
                                    <XCircle size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    {pendingRequests.length === 0 && (
                        <Text style={styles.emptyText}>All clear! No pending requests.</Text>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <TouchableOpacity style={styles.actionCard}>
                        <LinearGradient
                            colors={['#4B184C', '#7B2D7E']}
                            style={styles.actionGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <PlusCircle size={24} color="#fff" />
                            <Text style={styles.actionText}>Add New Venue Partner</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.actionCard, { marginTop: 15 }]}>
                        <LinearGradient
                            colors={['#C026D3', '#701A75']}
                            style={styles.actionGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <LayoutDashboard size={24} color="#fff" />
                            <Text style={styles.actionText}>System Performance Logs</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const StatCard = ({ label, value, icon }) => (
    <View style={styles.statCard}>
        <View style={styles.statIconBox}>{icon}</View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    infoBtn: { padding: 5 },
    scrollContent: { padding: 20 },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 30
    },
    statCard: {
        width: (width - 55) / 2,
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    statIconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    statValue: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
    statLabel: { fontSize: 13, color: '#64748B', marginTop: 2 },
    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
    badge: {
        backgroundColor: '#4B184C',
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#F1F5F9'
    },
    requestName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    requestTime: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
    requestActions: { flexDirection: 'row', gap: 8 },
    miniBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    approveBtn: { backgroundColor: '#10B981' },
    rejectBtn: { backgroundColor: '#EF4444' },
    emptyText: { textAlign: 'center', color: '#94A3B8', marginTop: 10, fontStyle: 'italic' },
    actionCard: { borderRadius: 20, overflow: 'hidden' },
    actionGradient: { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
    actionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
