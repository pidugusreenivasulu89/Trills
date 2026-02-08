import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Animated,
    Dimensions
} from 'react-native';
import { Sparkles, Star, Award, TrendingUp, ChevronLeft, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';

const { width } = Dimensions.get('window');

export default function RewardsScreen({ navigation }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [points, setPoints] = useState(0);
    const [tier, setTier] = useState('Silver');

    // Animation Values
    const scaleAnim = new Animated.Value(0.95);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        fetchRewardsData();
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            })
        ]).start();
    }, []);

    const fetchRewardsData = async () => {
        try {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
                // In a real app, fetch fresh points from API
                setPoints(parsedUser.points || 2450);
                setTier(parsedUser.tier || 'Gold');
            }
        } catch (error) {
            console.error('Error fetching rewards data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getProgress = () => {
        // Mock logic for tier progress
        const nextTier = 3000;
        return (points / nextTier) * 100;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4B184C" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="#fff" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Trills Rewards</Text>
                <TouchableOpacity style={styles.infoButton}>
                    <Sparkles color="#fff" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Main Card */}
                <Animated.View style={[styles.mainCardContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <LinearGradient
                        colors={['#4B184C', '#86198f', '#C026D3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                    >
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.tierLabel}>CURRENT STATUS</Text>
                                <Text style={styles.tierValue}>{tier} Member</Text>
                            </View>
                            <Award color="#FFD700" size={40} fill="#FFD700" style={{ opacity: 0.8 }} />
                        </View>

                        <View style={styles.pointsContainer}>
                            <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
                            <Text style={styles.pointsLabel}>Trills Miles</Text>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${getProgress()}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{3000 - points} miles to Platinum</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Quick Actions */}
                <View style={styles.actionsGrid}>
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                            <TrendingUp size={24} color="#D97706" />
                        </View>
                        <Text style={styles.actionText}>History</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
                            <Star size={24} color="#2563EB" />
                        </View>
                        <Text style={styles.actionText}>Benefits</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <View style={[styles.iconBox, { backgroundColor: '#D1FAE5' }]}>
                            <MapPin size={24} color="#059669" />
                        </View>
                        <Text style={styles.actionText}>Venues</Text>
                    </TouchableOpacity>
                </View>

                {/* Redeem Section */}
                <Text style={styles.sectionTitle}>Redeem Rewards</Text>

                <View style={styles.rewardItem}>
                    <View style={styles.rewardLeft}>
                        <View style={styles.rewardIconContainer}>
                            <Star size={20} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.rewardTitle}>Free Workspace Day</Text>
                            <Text style={styles.rewardSub}>Nexus Co-working</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.redeemButton}>
                        <Text style={styles.redeemText}>1,000 pts</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.rewardItem}>
                    <View style={styles.rewardLeft}>
                        <View style={[styles.rewardIconContainer, { backgroundColor: '#F59E0B' }]}>
                            <Award size={20} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.rewardTitle}>Complimentary Dessert</Text>
                            <Text style={styles.rewardSub}>Luminary Dining</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.redeemButton}>
                        <Text style={styles.redeemText}>500 pts</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.rewardItem}>
                    <View style={styles.rewardLeft}>
                        <View style={[styles.rewardIconContainer, { backgroundColor: '#10B981' }]}>
                            <Sparkles size={20} color="#fff" />
                        </View>
                        <View>
                            <Text style={styles.rewardTitle}>Priority Venue Access</Text>
                            <Text style={styles.rewardSub}>All Partner Venues</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.redeemButton}>
                        <Text style={styles.redeemText}>2,500 pts</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4B184C', // Dark header bg
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#4B184C',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    scrollContent: {
        backgroundColor: '#F8F9FA',
        flexGrow: 1,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingTop: 30,
        paddingBottom: 40,
        marginTop: 10,
    },
    mainCardContainer: {
        marginHorizontal: 20,
        marginBottom: 30,
        borderRadius: 24,
        elevation: 8,
        shadowColor: '#4B184C',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
    },
    cardGradient: {
        borderRadius: 24,
        padding: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    tierLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 1,
        marginBottom: 4,
    },
    tierValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: '800',
    },
    pointsContainer: {
        marginBottom: 24,
    },
    pointsValue: {
        color: '#fff',
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
    },
    pointsLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 14,
        fontWeight: '500',
    },
    progressContainer: {
        marginTop: 10,
    },
    progressBarBg: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 3,
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 3,
    },
    progressText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 12,
    },
    actionsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        marginBottom: 40,
    },
    actionButton: {
        alignItems: 'center',
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    actionText: {
        fontSize: 12,
        color: '#4B5563',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1F2937',
        marginLeft: 20,
        marginBottom: 20,
    },
    rewardItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    rewardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rewardIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#4B184C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    rewardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2,
    },
    rewardSub: {
        fontSize: 12,
        color: '#6B7280',
    },
    redeemButton: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
    },
    redeemText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#4B184C',
    },
});
