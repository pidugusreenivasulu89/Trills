import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { Star, ArrowRight } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

export default function HomeScreen({ navigation }) {
    const [topVenues, setTopVenues] = useState([]);

    useEffect(() => {
        fetchTopVenues();
    }, []);

    const fetchTopVenues = async () => {
        try {
            const response = await axios.get(ENDPOINTS.VENUES);
            setTopVenues(response.data.slice(0, 3));
        } catch (error) {
            console.log('Error fetching venues:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logoSmall}>🐦</Text>
                    <Text style={styles.headerTitle}>Trills</Text>
                </View>

                {/* Hero Section */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>Work, Dine, &{"\n"}
                        <Text style={{ color: '#4B184C' }}>Experience</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Discover the city's finest dining, co-working, and events.
                    </Text>
                </View>

                {/* Featured Experiences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Featured Experiences</Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        {/* Dining Card */}
                        <View style={styles.featureCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=1000' }}
                                style={styles.cardImage}
                            />
                            <View style={styles.cardContent}>
                                <View style={[styles.badge, { backgroundColor: 'rgba(75, 24, 76, 0.1)' }]}>
                                    <Text style={[styles.badgeText, { color: '#4B184C' }]}>Dineout</Text>
                                </View>
                                <Text style={styles.cardTitle}>Premium Dining</Text>
                                <TouchableOpacity style={styles.cardAction} onPress={() => navigation.navigate('Explore')}>
                                    <Text style={styles.actionText}>Book Table</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Workspace Card */}
                        <View style={styles.featureCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=1000' }}
                                style={styles.cardImage}
                            />
                            <View style={styles.cardContent}>
                                <View style={[styles.badge, { backgroundColor: 'rgba(75, 24, 76, 0.1)' }]}>
                                    <Text style={[styles.badgeText, { color: '#4B184C' }]}>Workspace</Text>
                                </View>
                                <Text style={styles.cardTitle}>Co-working</Text>
                                <TouchableOpacity style={styles.cardAction} onPress={() => navigation.navigate('Explore')}>
                                    <Text style={styles.actionText}>Book Desk</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Events Card */}
                        <View style={styles.featureCard}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1000' }}
                                style={styles.cardImage}
                            />
                            <View style={styles.cardContent}>
                                <View style={[styles.badge, { backgroundColor: 'rgba(75, 24, 76, 0.1)' }]}>
                                    <Text style={[styles.badgeText, { color: '#4B184C' }]}>Events</Text>
                                </View>
                                <Text style={styles.cardTitle}>Exclusive Events</Text>
                                <TouchableOpacity style={styles.cardAction} onPress={() => navigation.navigate('Feed')}>
                                    <Text style={styles.actionText}>Attend</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Top Picks */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Venues</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                            <Text style={styles.viewAll}>View All <ArrowRight size={14} /></Text>
                        </TouchableOpacity>
                    </View>

                    {topVenues.map(venue => (
                        <TouchableOpacity
                            key={venue.id || venue._id}
                            style={styles.venueCard}
                            onPress={() => navigation.navigate('VenueDetail', { venue })}
                        >
                            <Image source={{ uri: venue.image }} style={styles.venueImage} />
                            <View style={styles.venueInfo}>
                                <View style={styles.venueHeader}>
                                    <Text style={styles.venueName}>{venue.name}</Text>
                                    <View style={styles.ratingRow}>
                                        <Star size={12} fill="#fbbf24" color="#fbbf24" />
                                        <Text style={styles.ratingText}>{venue.rating}</Text>
                                    </View>
                                </View>
                                <Text style={styles.venueAddress}>{venue.address}</Text>
                                <View style={styles.venueFooter}>
                                    <Text style={styles.venueCategory}>{venue.category}</Text>
                                    <Text style={styles.venuePrice}>Budget: {venue.priceRange}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        gap: 10,
    },
    logoSmall: {
        fontSize: 28,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1a1a1a',
        letterSpacing: -0.5,
    },
    hero: {
        padding: 24,
        paddingTop: 24,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        lineHeight: 40,
    },
    heroSubtitle: {
        fontSize: 16,
        color: '#64748b',
        marginTop: 12,
    },
    section: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 20,
    },
    viewAll: {
        color: '#4B184C',
        fontWeight: '600',
        fontSize: 14,
    },
    horizontalScroll: {
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    featureCard: {
        width: 250,
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginRight: 16,
        overflow: 'hidden',
    },
    cardImage: {
        height: 140,
        width: '100%',
    },
    cardContent: {
        padding: 16,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 12,
    },
    cardAction: {
        backgroundColor: '#4B184C',
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
    venueCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        marginBottom: 16,
        overflow: 'hidden',
    },
    venueImage: {
        width: 100,
        height: 100,
    },
    venueInfo: {
        flex: 1,
        padding: 12,
    },
    venueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    venueName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#fbbf24',
    },
    venueAddress: {
        fontSize: 12,
        color: '#64748b',
        marginTop: 4,
    },
    venueFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    venueCategory: {
        fontSize: 10,
        color: '#4B184C',
        backgroundColor: 'rgba(75, 24, 76, 0.05)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    venuePrice: {
        fontSize: 11,
        fontWeight: '600',
        color: '#1a1a1a',
    }
});
