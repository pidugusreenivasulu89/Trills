import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as LocalAuthentication from 'expo-local-authentication';

// Auth Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import EventsScreen from './src/screens/EventsScreen';
import FeedScreen from './src/screens/FeedScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import VenueDetailScreen from './src/screens/VenueDetailScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import VerificationScreen from './src/screens/VerificationScreen';
import PaymentsScreen from './src/screens/PaymentsScreen';
import PrivacySettingsScreen from './src/screens/PrivacySettingsScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import CommentsScreen from './src/screens/CommentsScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import TermsScreen from './src/screens/TermsScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import AdminScreen from './src/screens/AdminScreen';
import ConnectionsScreen from './src/screens/ConnectionsScreen';
import ChatScreen from './src/screens/ChatScreen';
import BiometricUnlockScreen from './src/screens/BiometricUnlockScreen';
import { isProfileComplete, normalizeUser, USER_STORAGE_KEY } from './src/utils/profileSession';

import { Home as HomeIcon, Compass, Calendar, MessageSquare, User } from 'lucide-react-native';
import AppErrorBoundary from './src/components/AppErrorBoundary';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false, // Cleaner, less confusing look
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 90 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    elevation: 20,
                    shadowColor: '#4B184C',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    borderTopLeftRadius: 25,
                    borderTopRightRadius: 25,
                    position: 'absolute',
                    bottom: 0,
                },
                tabBarActiveTintColor: '#4B184C',
                tabBarInactiveTintColor: '#94a3b8',
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, focused && styles.activeTab]}>
                            <HomeIcon color={focused ? '#4B184C' : '#94a3b8'} size={focused ? 26 : 24} />
                            {focused && <View style={styles.activeDot} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, focused && styles.activeTab]}>
                            <Compass color={focused ? '#4B184C' : '#94a3b8'} size={focused ? 26 : 24} />
                            {focused && <View style={styles.activeDot} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Events"
                component={EventsScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, focused && styles.activeTab]}>
                            <Calendar color={focused ? '#4B184C' : '#94a3b8'} size={focused ? 26 : 24} />
                            {focused && <View style={styles.activeDot} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, focused && styles.activeTab]}>
                            <MessageSquare color={focused ? '#4B184C' : '#94a3b8'} size={focused ? 26 : 24} />
                            {focused && <View style={styles.activeDot} />}
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.tabItem, focused && styles.activeTab]}>
                            <User color={focused ? '#4B184C' : '#94a3b8'} size={focused ? 26 : 24} />
                            {focused && <View style={styles.activeDot} />}
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

const styles = {
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    activeTab: {
        backgroundColor: 'rgba(75, 24, 76, 0.05)',
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#4B184C',
        position: 'absolute',
        bottom: -6,
    },
};

export default function App() {
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [initialRouteName, setInitialRouteName] = useState('Welcome');

    useEffect(() => {
        const bootstrapNavigation = async () => {
            try {
                const [storedUser, onboardingComplete] = await Promise.all([
                    AsyncStorage.getItem(USER_STORAGE_KEY),
                    AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
                ]);

                if (storedUser) {
                    const parsedUser = normalizeUser(JSON.parse(storedUser));
                    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsedUser));
                    const hasSessionIdentity = Boolean(parsedUser.email || parsedUser.phone || parsedUser._id || parsedUser.id);
                    const canUseBiometrics = Platform.OS !== 'web'
                        && hasSessionIdentity
                        && await LocalAuthentication.hasHardwareAsync()
                        && await LocalAuthentication.isEnrolledAsync();
                    setInitialRouteName(canUseBiometrics ? 'BiometricUnlock' : (hasSessionIdentity ? 'MainTabs' : (isProfileComplete(parsedUser) ? 'MainTabs' : 'EditProfile')));
                } else if (onboardingComplete === 'true') {
                    setInitialRouteName('Login');
                } else {
                    setInitialRouteName('Welcome');
                }
            } catch (error) {
                console.warn('Unable to restore app session:', error?.message || error);
                setInitialRouteName('Welcome');
            } finally {
                setIsBootstrapping(false);
            }
        };

        bootstrapNavigation();
    }, []);

    if (isBootstrapping) {
        return (
            <AppErrorBoundary>
                <SafeAreaProvider>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
                        <ActivityIndicator size="large" color="#4B184C" />
                    </View>
                </SafeAreaProvider>
            </AppErrorBoundary>
        );
    }

    return (
        <AppErrorBoundary>
            <SafeAreaProvider>
                <NavigationContainer>
                    <Stack.Navigator
                        initialRouteName={initialRouteName}
                        screenOptions={{ headerShown: false }}
                    >
                        {/* Auth Screens */}
                        <Stack.Screen name="Welcome" component={WelcomeScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="BiometricUnlock" component={BiometricUnlockScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        <Stack.Screen name="Terms" component={TermsScreen} />

                        {/* Main App */}
                        <Stack.Screen name="MainTabs" component={TabNavigator} />
                        <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ headerShown: false, presentation: 'modal' }} />
                        <Stack.Screen name="VenueDetail" component={VenueDetailScreen} options={{ headerShown: true, title: 'Venue Details' }} />
                        <Stack.Screen name="Bookings" component={BookingsScreen} options={{ headerShown: true, title: 'My Bookings' }} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: 'Settings' }} />
                        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Verification" component={VerificationScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Payments" component={PaymentsScreen} options={{ headerShown: true, title: 'Payment Methods' }} />
                        <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} options={{ headerShown: true, title: 'Privacy Settings' }} />
                        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Comments" component={CommentsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
                        <Stack.Screen name="Rewards" component={RewardsScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Connections" component={ConnectionsScreen} options={{ headerShown: true, title: 'Connections' }} />
                        <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ headerShown: true, title: route.params?.recipient?.name || 'Message' })} />
                    </Stack.Navigator>
                </NavigationContainer>
            </SafeAreaProvider>
        </AppErrorBoundary>
    );
}
