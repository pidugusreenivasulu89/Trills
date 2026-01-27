import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, Trash2, ShieldCheck, Clock } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export default function BookingsScreen() {
    const [bookings, setBookings] = useState([
        { id: '65b2a...', venueName: 'Luminary Dining', date: '2026-02-14', time: '20:00', status: 'confirmed', amountPaid: 99 },
    ]);

    const handleCancel = (bookingId) => {
        Alert.alert(
            "Cancel Booking?",
            "Cancellations within 4 hours of the booking time are non-refundable (₹99 fee). Proceed?",
            [
                { text: "No, Keep it", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const res = await axios.post(ENDPOINTS.CANCEL_BOOKING, { bookingId });
                            Alert.alert("Success", res.data.message);
                            // Update local state
                            setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
                        } catch (err) {
                            Alert.alert("Error", "Could not cancel booking. Try again.");
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Bookings</Text>
            </View>
            <ScrollView contentContainerStyle={styles.list}>
                {bookings.map((item) => (
                    <View key={item.id} style={[styles.card, item.status === 'cancelled' && styles.cancelledCard]}>
                        <View style={styles.cardHeader}>
                            <View style={item.status === 'cancelled' ? styles.cancelledBadge : styles.typeBadge}>
                                <Text style={item.status === 'cancelled' ? styles.cancelledBadgeText : styles.typeText}>
                                    {item.status.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.refundText}>{item.status === 'cancelled' ? 'Processing Refund...' : '₹99 Advance Paid'}</Text>
                        </View>

                        <Text style={styles.venueName}>{item.venueName}</Text>

                        <View style={styles.infoRow}>
                            <Calendar size={14} color="#64748b" />
                            <Text style={styles.infoText}>{item.date} • {item.time}</Text>
                        </View>

                        {item.status === 'confirmed' ? (
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <ShieldCheck size={16} color="#4B184C" />
                                    <Text style={styles.actionText}>Digital Ticket</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.cancelBtn}
                                    onPress={() => handleCancel(item.id)}
                                >
                                    <Trash2 size={16} color="#ef4444" />
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.cancelledFooter}>
                                <Clock size={14} color="#94a3b8" />
                                <Text style={styles.footerNote}>Table released to community</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fcfcfc' },
    header: { padding: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    list: { padding: 24 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#f1f5f9', elevation: 2 },
    cancelledCard: { opacity: 0.7, backgroundColor: '#f8fafc' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    typeBadge: { backgroundColor: 'rgba(75, 24, 76, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    typeText: { fontSize: 10, color: '#4B184C', fontWeight: '800' },
    cancelledBadge: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    cancelledBadgeText: { fontSize: 10, color: '#ef4444', fontWeight: '800' },
    refundText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
    venueName: { fontSize: 20, fontWeight: '800', marginBottom: 8, color: '#1e293b' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 },
    infoText: { color: '#64748b', fontSize: 14, fontWeight: '500' },
    actionRow: { flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 15 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
    actionText: { color: '#4B184C', fontWeight: '700', fontSize: 14 },
    cancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center' },
    cancelText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
    cancelledFooter: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
    footerNote: { color: '#94a3b8', fontSize: 13, fontStyle: 'italic' }
});
