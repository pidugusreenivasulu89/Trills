import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export default function EventsScreen({ navigation }) {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await axios.get(ENDPOINTS.EVENTS);
            setEvents(response.data);
        } catch (error) {
            console.log('Error fetching events:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Trending Events</Text>
                <Text style={styles.headerSubtitle}>Discover curated social experiences</Text>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4B184C" />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {events.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Calendar size={48} color="#cbd5e1" />
                            <Text style={styles.emptyText}>No events scheduled right now.</Text>
                            <TouchableOpacity style={styles.refreshBtn} onPress={fetchEvents}>
                                <Text style={styles.refreshBtnText}>Refresh</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        events.map(event => (
                            <TouchableOpacity
                                key={event.id || event._id}
                                style={styles.eventCard}
                                activeOpacity={0.9}
                            >
                                <Image source={{ uri: event.image }} style={styles.eventImage} />
                                <View style={styles.eventDetails}>
                                    <View style={styles.dateBadge}>
                                        <Text style={styles.dateText}>
                                            {new Date(event.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>

                                    <Text style={styles.eventTitle}>{event.title}</Text>

                                    <View style={styles.infoRow}>
                                        <Clock size={14} color="#64748b" />
                                        <Text style={styles.infoText}>{event.time}</Text>
                                    </View>

                                    <View style={styles.infoRow}>
                                        <MapPin size={14} color="#64748b" />
                                        <Text style={styles.infoText}>{event.location || 'Premium Venue'}</Text>
                                    </View>

                                    <View style={styles.cardFooter}>
                                        <Text style={styles.priceText}>{event.price === 0 ? 'Free Entry' : `₹${event.price}`}</Text>
                                        <View style={styles.actionBtn}>
                                            <Text style={styles.actionBtnText}>Book Now</Text>
                                            <ArrowRight size={14} color="#fff" />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={{ height: 100 }} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 24,
        paddingTop: 8,
    },
    eventCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 24,
        overflow: 'hidden',
        shadowColor: '#4B184C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    eventImage: {
        width: '100%',
        height: 180,
    },
    eventDetails: {
        padding: 20,
    },
    dateBadge: {
        backgroundColor: 'rgba(75, 24, 76, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
    },
    dateText: {
        color: '#4B184C',
        fontWeight: '700',
        fontSize: 12,
    },
    eventTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    infoText: {
        color: '#64748b',
        fontSize: 14,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
    },
    priceText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    actionBtn: {
        backgroundColor: '#4B184C',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    actionBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 16,
        textAlign: 'center',
    },
    refreshBtn: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#4B184C',
    },
    refreshBtnText: {
        color: '#4B184C',
        fontWeight: '600',
    }
});
