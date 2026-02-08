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
import { Star, ArrowRight, Quote, Users, MapPin, Zap, Award } from 'lucide-react-native';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import { Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
    const [topVenues, setTopVenues] = useState([]);
    const [loyaltyData, setLoyaltyData] = useState({ points: 2450, tier: 'Gold' });
    const scrollY = React.useRef(new Animated.Value(0)).current;
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const slideAnim = React.useRef(new Animated.Value(30)).current;

    useEffect(() => {
        fetchTopVenues();
        fetchLoyaltyData();
        const unsubscribe = navigation.addListener('focus', fetchLoyaltyData);
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
        return unsubscribe;
    }, [navigation]);

    const fetchTopVenues = async () => {
        try {
            const response = await axios.get(ENDPOINTS.VENUES);
            if (response.data) setTopVenues(response.data.slice(0, 3));
        } catch (error) {
            console.log('Error fetching venues:', error);
        }
    };

    const fetchLoyaltyData = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                setLoyaltyData({
                    points: user.points || 2450,
                    tier: user.tier || 'Silver'
                });
            }
        } catch (e) { console.log(e); }
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
                <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={styles.heroTitle}>Work, Dine, &{"\n"}
                        <Text style={{ color: '#4B184C' }}>Experience</Text>
                    </Text>
                    <Text style={styles.heroSubtitle}>
                        Discover the city's finest dining, co-working, and events.
                    </Text>
                </Animated.View>

                {/* Quick Stats Section */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Users size={20} color="#4B184C" />
                        <Text style={styles.statNum}>50k+</Text>
                        <Text style={styles.statLabel}>Users</Text>
                    </View>
                    <View style={styles.statBox}>
                        <MapPin size={20} color="#4B184C" />
                        <Text style={styles.statNum}>200+</Text>
                        <Text style={styles.statLabel}>Venues</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Zap size={20} color="#4B184C" />
                        <Text style={styles.statNum}>4.9/5</Text>
                        <Text style={styles.statLabel}>Rating</Text>
                    </View>
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

                {/* Trills Miles / Rewards Section */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.loyaltyCard}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <LinearGradient
                            colors={['#4B184C', '#86198f']}
                            style={styles.loyaltyGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <View style={styles.loyaltyLeft}>
                                <View style={styles.milesBadge}>
                                    <Text style={styles.milesValue}>{loyaltyData.points.toLocaleString()}</Text>
                                    <Text style={styles.milesLabel}>Miles</Text>
                                </View>
                                <View style={{ marginLeft: 15 }}>
                                    <Text style={styles.loyaltyTitle}>{loyaltyData.tier} Member</Text>
                                    <Text style={styles.loyaltySub}>{3000 - loyaltyData.points > 0 ? `${3000 - loyaltyData.points} miles to Platinum` : 'Top Tier Status'}</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.redeemBtn} onPress={() => navigation.navigate('Profile')}>
                                <Text style={styles.redeemText}>Redeem</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* Testimonials */}
                <View style={[styles.section, { backgroundColor: '#FDF4FF', paddingVertical: 32, marginHorizontal: -24, paddingHorizontal: 24, marginTop: 40 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Quote size={20} color="#C026D3" fill="#C026D3" />
                        <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>What users say</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                        <View style={styles.testimonialCard}>
                            <Text style={styles.testimonialText}>"Trills made finding co-working spaces so easy. The connection feature is a game changer!"</Text>
                            <View style={styles.testimonialUser}>
                                <Image source={{ uri: 'https://i.pravatar.cc/150?u=a' }} style={styles.testimonialAvatar} />
                                <View>
                                    <Text style={styles.testimonialName}>Sarah Johnson</Text>
                                    <Text style={styles.testimonialRole}>Product Designer</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.testimonialCard}>
                            <Text style={styles.testimonialText}>"Premium dining bookings are seamless. I love the verified badge system, it feels secure."</Text>
                            <View style={styles.testimonialUser}>
                                <Image source={{ uri: 'https://i.pravatar.cc/150?u=b' }} style={styles.testimonialAvatar} />
                                <View>
                                    <Text style={styles.testimonialName}>Michael Chen</Text>
                                    <Text style={styles.testimonialRole}>Entrepreneur</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.testimonialCard}>
                            <Text style={styles.testimonialText}>"The events section keeps me updated with all the cool tech meetups in Bangalore."</Text>
                            <View style={styles.testimonialUser}>
                                <Image source={{ uri: 'https://i.pravatar.cc/150?u=c' }} style={styles.testimonialAvatar} />
                                <View>
                                    <Text style={styles.testimonialName}>Priya Sharma</Text>
                                    <Text style={styles.testimonialRole}>Software Engineer</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Top Picks */}
                <View style={[styles.section, { marginTop: 40 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Top Venues</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
                            <Text style={styles.viewAll}>View All <ArrowRight size={14} /></Text>
                        </TouchableOpacity>
                    </View>

                    {topVenues.map((venue, index) => (
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
    },
    // New Styles
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: '#fff',
        marginHorizontal: 24,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#4B184C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    statBox: {
        alignItems: 'center',
        padding: 10,
    },
    statNum: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 11,
        color: '#64748b',
    },
    testimonialCard: {
        width: 280,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        marginRight: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    testimonialText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: '#475569',
        lineHeight: 20,
        marginBottom: 16,
    },
    testimonialUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    testimonialAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    testimonialName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    testimonialRole: {
        fontSize: 11,
        color: '#7B2D7E',
        fontWeight: '600',
    },
    loyaltyCard: {
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#4B184C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    loyaltyGradient: {
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    loyaltyLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    milesBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center',
        minWidth: 70,
    },
    milesValue: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '900',
    },
    milesLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    loyaltyTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    loyaltySub: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        marginTop: 2,
    },
    redeemBtn: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    redeemText: {
        color: '#4B184C',
        fontWeight: '800',
        fontSize: 13,
    }
});
