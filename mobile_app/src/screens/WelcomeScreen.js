import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    FlatList,
    SafeAreaView,
    StatusBar,
    Easing,
    Image
} from 'react-native';
import { Heart, Users, Calendar, Shield, ArrowRight } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const onboardingData = [
    {
        id: '1',
        title: 'Social Connections',
        description: 'Connect with like-minded people and discover meaningful relationships.',
        icon: Heart,
        color: '#4B184C',
        bgColor: '#FDF4FF',
    },
    {
        id: '2',
        title: 'Build Community',
        description: 'Join a vibrant community and make lasting friendships nearby.',
        icon: Users,
        color: '#4B184C',
        bgColor: '#FDF4FF',
    },
    {
        id: '3',
        title: 'Plan Events',
        description: 'Book venues and plan special moments with your connections.',
        icon: Calendar,
        color: '#4B184C',
        bgColor: '#FDF4FF',
    },
    {
        id: '4',
        title: 'Safe & Secure',
        description: 'Your privacy and security are our top priorities always.',
        icon: Shield,
        color: '#4B184C',
        bgColor: '#FDF4FF',
    },
];

export default function WelcomeScreen({ navigation }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef(null);

    // Concept Animations
    const birdAnim = useRef({
        x: new Animated.Value(-100),
        y: new Animated.Value(150),
        scale: new Animated.Value(1),
    }).current;
    const heartPulse = useRef(new Animated.Value(1)).current;
    const logoFade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Sequenced flight animation
        Animated.sequence([
            // 1. Logo fades in first
            Animated.timing(logoFade, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            // 2. Bird flies in and lands
            Animated.parallel([
                Animated.timing(birdAnim.x, {
                    toValue: width / 2 - 90, // Calibrated landing position for 'T'
                    duration: 2000,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.timing(birdAnim.y, {
                    toValue: 20, // Sit better on the text baseline
                    duration: 2000,
                    easing: Easing.out(Easing.exp),
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(birdAnim.scale, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
                    Animated.timing(birdAnim.scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
                ])
            ]),
            // 3. Heart Pulse after landing
            Animated.loop(
                Animated.sequence([
                    Animated.timing(heartPulse, { toValue: 1.3, duration: 500, useNativeDriver: true }),
                    Animated.timing(heartPulse, { toValue: 1, duration: 500, useNativeDriver: true }),
                ]),
                { iterations: 5 }
            )
        ]).start();
    }, []);

    const onViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems && viewableItems.length > 0) {
            setCurrentIndex(viewableItems[0].index);
        }
    }).current;

    const viewabilityConfig = useRef({
        viewAreaCoveragePercentThreshold: 50,
    }).current;

    const handleNext = () => {
        if (currentIndex < onboardingData.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: currentIndex + 1,
                animated: true,
            });
        } else {
            navigation.replace('Login');
        }
    };

    const handleSkip = () => {
        navigation.replace('Login');
    };

    const renderItem = ({ item, index }) => {
        const IconComponent = item.icon;
        return (
            <View style={styles.slide}>
                <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                    <IconComponent color={item.color} size={64} strokeWidth={2.5} />
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
        );
    };

    const Pagination = () => {
        return (
            <View style={styles.paginationContainer}>
                {onboardingData.map((_, index) => {
                    const inputRange = [
                        (index - 1) * width,
                        index * width,
                        (index + 1) * width,
                    ];

                    const dotWidth = scrollX.interpolate({
                        inputRange,
                        outputRange: [10, 30, 10], // Slightly wider active dot
                        extrapolate: 'clamp',
                    });

                    const opacity = scrollX.interpolate({
                        inputRange,
                        outputRange: [0.3, 1, 0.3],
                        extrapolate: 'clamp',
                    });

                    return (
                        <Animated.View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    width: dotWidth,
                                    opacity,
                                    backgroundColor: '#4B184C', // Static Theme Color
                                },
                            ]}
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            {/* Animated Brand Intro */}
            <View style={styles.brandIntro}>
                <Animated.View style={[styles.birdContainer, {
                    transform: [
                        { translateX: birdAnim.x },
                        { translateY: birdAnim.y },
                        { scale: birdAnim.scale }
                    ]
                }]}>
                    <View style={styles.birdWithLove}>
                        <Animated.View style={{ transform: [{ scale: heartPulse }] }}>
                            <Heart size={14} color="#EF4444" fill="#EF4444" style={styles.heartIcon} />
                        </Animated.View>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.logoInApp}
                            resizeMode="contain"
                        />
                    </View>
                </Animated.View>

                <Animated.View style={[styles.logoContainer, { opacity: logoFade }]}>
                    <Text style={styles.logoText}>Trills</Text>
                </Animated.View>
            </View>

            {/* Slides */}
            <FlatList
                ref={flatListRef}
                data={onboardingData}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
                scrollEventThrottle={16}
            />

            {/* Bottom Controls */}
            <View style={styles.bottomContainer}>
                <Pagination />

                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        { backgroundColor: '#4B184C' } // Static Theme Color
                    ]}
                    onPress={handleNext}
                    activeOpacity={0.8}
                >
                    <Text style={styles.nextButtonText}>
                        {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
                    </Text>
                    {currentIndex !== onboardingData.length - 1 && (
                        <ArrowRight color="#fff" size={20} style={{ marginLeft: 8 }} />
                    )}
                </TouchableOpacity>
            </View>
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
        justifyContent: 'flex-end',
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    skipButton: {
        padding: 8,
    },
    skipText: {
        color: '#64748b',
        fontSize: 16,
        fontWeight: '600',
    },
    brandIntro: {
        height: 220,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FDF4FF',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        paddingTop: 20,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#4B184C',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    birdContainer: {
        position: 'absolute',
        zIndex: 10,
    },
    birdWithLove: {
        alignItems: 'center',
    },
    heartIcon: {
        marginBottom: -5,
        zIndex: 2,
    },
    logoInApp: {
        width: 60,
        height: 60,
    },
    logoContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    logoText: {
        fontSize: 56,
        fontWeight: '900',
        color: '#4B184C',
        letterSpacing: -2,
    },
    slide: {
        width: width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 40, // Adjust for top spacing
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#1e293b',
        marginBottom: 16,
        textAlign: 'center',
    },
    description: {
        fontSize: 17,
        color: '#64748b', // Slate gray
        textAlign: 'center',
        lineHeight: 26,
    },
    bottomContainer: {
        paddingHorizontal: 40,
        paddingBottom: 50,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        height: 10,
    },
    dot: {
        height: 10,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    nextButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    nextButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
