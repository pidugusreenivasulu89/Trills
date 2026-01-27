import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { CreditCard, Plus, Trash2, ChevronRight } from 'lucide-react-native';

export default function PaymentsScreen() {
    const [cards, setCards] = useState([
        { id: '1', type: 'Visa', last4: '4242', expiry: '12/26', color: '#1a1a1a' },
        { id: '2', type: 'Mastercard', last4: '8891', expiry: '05/25', color: '#4B184C' }
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Payment Methods</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Your Cards</Text>

                {cards.map(card => (
                    <View key={card.id} style={[styles.card, { backgroundColor: card.color }]}>
                        <View style={styles.cardTop}>
                            <CreditCard color="#fff" size={24} />
                            <Text style={styles.cardType}>{card.type}</Text>
                        </View>
                        <Text style={styles.cardNumber}>**** **** **** {card.last4}</Text>
                        <View style={styles.cardBottom}>
                            <View>
                                <Text style={styles.cardLabel}>Card Holder</Text>
                                <Text style={styles.cardValue}>Sreenivasulu P</Text>
                            </View>
                            <View>
                                <Text style={styles.cardLabel}>Expires</Text>
                                <Text style={styles.cardValue}>{card.expiry}</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.deleteBtn}>
                            <Trash2 color="#fff" size={16} />
                        </TouchableOpacity>
                    </View>
                ))}

                <TouchableOpacity style={styles.addBtn}>
                    <Plus color="#4B184C" size={20} />
                    <Text style={styles.addBtnText}>Add New Payment Method</Text>
                </TouchableOpacity>

                <View style={styles.billingSection}>
                    <Text style={styles.sectionTitle}>Billing Address</Text>
                    <View style={styles.billingCard}>
                        <Text style={styles.addressName}>Sreenivasulu P</Text>
                        <Text style={styles.addressText}>123 Tech Park, HSR Layout</Text>
                        <Text style={styles.addressText}>Bangalore, KA 560102</Text>
                        <TouchableOpacity>
                            <Text style={styles.editText}>Edit Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { padding: 24 },
    title: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
    content: { padding: 24 },
    sectionTitle: { fontSize: 13, textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: 1, marginBottom: 15 },
    card: { height: 180, borderRadius: 20, padding: 24, marginBottom: 20, position: 'relative', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
    cardType: { color: '#fff', fontSize: 16, fontWeight: '700' },
    cardNumber: { color: '#fff', fontSize: 20, fontWeight: '600', letterSpacing: 2, marginBottom: 30 },
    cardBottom: { flexDirection: 'row', gap: 40 },
    cardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, textTransform: 'uppercase', marginBottom: 4 },
    cardValue: { color: '#fff', fontSize: 14, fontWeight: '600' },
    deleteBtn: { position: 'absolute', top: 20, right: 20, padding: 8 },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, marginTop: 10 },
    addBtnText: { color: '#4B184C', fontWeight: '700', fontSize: 15 },
    billingSection: { marginTop: 40 },
    billingCard: { backgroundColor: '#f8fafc', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
    addressName: { fontWeight: '700', fontSize: 16, marginBottom: 8, color: '#1e293b' },
    addressText: { color: '#64748b', fontSize: 14, marginBottom: 4 },
    editText: { color: '#4B184C', fontSize: 14, fontWeight: '700', marginTop: 12 }
});
