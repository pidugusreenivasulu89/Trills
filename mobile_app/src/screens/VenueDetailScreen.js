import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
    Modal,
    ActivityIndicator
} from 'react-native';
import { Star, MapPin, CreditCard, Lock, CheckCircle } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export default function VenueDetailScreen({ route, navigation }) {
    const { venue } = route.params;
    const [bookingStep, setBookingStep] = useState(1); // 1: Select, 2: Payment, 3: Success
    const [loading, setLoading] = useState(false);
    const [guests, setGuests] = useState('1');
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);

    const rows = venue.layout?.rows || 5;
    const cols = venue.layout?.cols || 5;

    const handlePayment = async () => {
        setLoading(true);
        setTimeout(async () => {
            try {
                await axios.post(ENDPOINTS.BOOKINGS, {
                    venueId: venue._id || venue.id,
                    guests: Number(guests),
                    tableNumber: selectedTable.number,
                    amountPaid: 99,
                    currency: 'INR',
                    bookingTime: selectedTime,
                    bookingDate: new Date().toISOString().split('T')[0]
                });
                setLoading(false);
                setBookingStep(3);
            } catch (error) {
                setLoading(false);
                alert('Booking failed. Please check your connection.');
            }
        }, 2000);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <Image source={{ uri: venue.image }} style={styles.image} />

                <View style={styles.details}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{venue.name}</Text>
                        <View style={styles.ratingBox}>
                            <Star size={16} fill="#fbbf24" color="#fbbf24" />
                            <Text style={styles.ratingText}>{venue.rating}</Text>
                        </View>
                    </View>

                    <Text style={styles.description}>{venue.description}</Text>

                    {/* Booking Section */}
                    <View style={styles.bookingCard}>
                        {bookingStep === 1 && (
                            <>
                                <Text style={styles.bookingTitle}>1. Select Table & Guests</Text>

                                <Text style={styles.label}>Choose your seating / spot</Text>
                                <View style={[styles.tableGrid, { width: '100%' }]}>
                                    {Array.from({ length: rows * cols }).map((_, i) => {
                                        const r = Math.floor(i / cols);
                                        const c = i % cols;
                                        const asset = venue.tables?.find(t => t.row === r && t.col === c);

                                        if (!asset) return <View key={i} style={[styles.tableItem, { borderStyle: 'dotted', opacity: 0.1 }]} />;

                                        const isSelected = selectedTable?.number === asset.number;

                                        return (
                                            <TouchableOpacity
                                                key={i}
                                                style={[
                                                    styles.tableItem,
                                                    isSelected && styles.selectedTable,
                                                    asset.type === 'meeting_room' && { borderColor: '#10b981' },
                                                    asset.type === 'group_table' && { borderColor: '#3b82f6' }
                                                ]}
                                                onPress={() => {
                                                    setSelectedTable(asset);
                                                    setGuests(String(asset.capacity));
                                                }}
                                            >
                                                <Text style={[styles.tableLabel, isSelected && { color: '#fff' }]}>
                                                    {asset.type === 'meeting_room' ? 'Room' : asset.type === 'single_chair' ? 'Chair' : asset.type === 'group_table' ? 'Group' : `T${asset.number}`}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                {selectedTable && (
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={styles.label}>Select Available Time</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            {(selectedTable.slots?.length > 0 ? selectedTable.slots : ["09:00", "11:00", "14:00", "16:00", "19:00"]).map(time => (
                                                <TouchableOpacity
                                                    key={time}
                                                    style={[styles.timeSlot, selectedTime === time && styles.selectedTimeSlot]}
                                                    onPress={() => setSelectedTime(time)}
                                                >
                                                    <Text style={[styles.timeText, selectedTime === time && { color: '#fff' }]}>{time}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <Text style={styles.label}>Number of Guests</Text>
                                <TextInput
                                    style={styles.input}
                                    value={guests}
                                    onChangeText={setGuests}
                                    keyboardType="numeric"
                                />

                                <TouchableOpacity
                                    style={[styles.button, (!selectedTable || !selectedTime) && { opacity: 0.5 }]}
                                    onPress={() => selectedTable && selectedTime && setBookingStep(2)}
                                >
                                    <Text style={styles.buttonText}>Confirm Slot & Secure</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {bookingStep === 2 && (
                            <>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={styles.bookingTitle}>2. Secure Booking</Text>
                                    <View style={styles.miniBadge}><Text style={styles.miniBadgeText}>{selectedTable?.type.replace('_', ' ')} #{selectedTable?.number}</Text></View>
                                </View>

                                <View style={styles.paymentSummary}>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Base Reservation</Text>
                                        <Text style={[styles.summaryValue, { textDecorationLine: 'line-through' }]}>{venue.priceRange}</Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={styles.summaryLabel}>Booking Advance (Secure Seat)</Text>
                                        <Text style={styles.summaryValue}>₹99</Text>
                                    </View>
                                    <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10, marginTop: 5 }]}>
                                        <Text style={[styles.summaryLabel, { fontWeight: '700', color: '#1e293b' }]}>Total Due Now</Text>
                                        <Text style={[styles.summaryValue, { color: '#4B184C', fontSize: 18 }]}>₹99</Text>
                                    </View>
                                    <Text style={styles.disclaimer}>Pay the remainder at the venue.</Text>
                                </View>

                                <View style={styles.cardInput}>
                                    <CreditCard size={20} color="#4B184C" />
                                    <TextInput placeholder="Card Number" style={styles.flexInput} keyboardType="numeric" placeholderTextColor="#94a3b8" />
                                </View>

                                <TouchableOpacity
                                    style={[styles.button, loading && { opacity: 0.7 }]}
                                    onPress={handlePayment}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text style={styles.buttonText}><Lock size={16} /> Pay ₹99 to Book</Text>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setBookingStep(1)}>
                                    <Text style={styles.cancelLink}>Change Table</Text>
                                </TouchableOpacity>
                            </>
                        )}

                        {bookingStep === 3 && (
                            <View style={styles.successBox}>
                                <CheckCircle size={60} color="#10b981" />
                                <Text style={styles.successTitle}>Booking Confirmed!</Text>
                                <Text style={styles.successSub}>Your table at {venue.name} is ready.</Text>
                                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Dashboard')}>
                                    <Text style={styles.buttonText}>Done</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
                <View style={{ height: 60 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    image: {
        width: '100%',
        height: 250,
    },
    details: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
        flex: 1,
    },
    ratingBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#fffbeb',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fbbf24',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 12,
    },
    badge: {
        backgroundColor: '#f1f5f9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        color: '#475569',
        fontWeight: '600',
    },
    priceText: {
        fontSize: 14,
        color: '#4B184C',
        fontWeight: '700',
    },
    description: {
        fontSize: 16,
        color: '#64748b',
        lineHeight: 24,
        marginTop: 20,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 10,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 16,
    },
    address: {
        fontSize: 14,
        color: '#475569',
        flex: 1,
    },
    bookingCard: {
        marginTop: 32,
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f1f5f9',
        shadowColor: '#4B184C',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    bookingTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        color: '#1a1a1a',
        marginBottom: 20,
    },
    flexInput: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#1a1a1a',
    },
    cardInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#4B184C',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
    },
    paymentSummary: {
        marginBottom: 20,
        paddingBottom: 20,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: { color: '#64748b', fontSize: 14 },
    summaryValue: { fontWeight: '600', color: '#1a1a1a', fontSize: 14 },
    disclaimer: { fontSize: 11, color: '#94a3b8', fontStyle: 'italic', marginTop: 10 },
    tableGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 24,
        marginTop: 10,
    },
    tableItem: {
        width: '31%',
        aspectRatio: 1,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    selectedTable: {
        backgroundColor: '#4B184C',
        borderColor: '#4B184C',
    },
    tableLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    tableType: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 2,
    },
    miniBadge: {
        backgroundColor: 'rgba(75, 24, 76, 0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    miniBadgeText: {
        color: '#4B184C',
        fontSize: 12,
        fontWeight: '700',
    },
    cancelLink: {
        textAlign: 'center',
        marginTop: 16,
        color: '#64748b',
        fontSize: 14,
    },
    timeSlot: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#f8fafc',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    selectedTimeSlot: {
        backgroundColor: '#4B184C',
        borderColor: '#4B184C',
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
    },
    successBox: {
        alignItems: 'center',
        padding: 20,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1a1a1a',
        marginTop: 20,
        marginBottom: 8,
    },
    successSub: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 32,
    }
});
