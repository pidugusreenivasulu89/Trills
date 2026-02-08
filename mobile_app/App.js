import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Auth Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import ExploreScreen from './src/screens/ExploreScreen';
import EventsScreen from './src/screens/EventsScreen';
import FeedScreen from './src/screens/FeedScreen';
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

import { Home as HomeIcon, Compass, Calendar, MessageSquare, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#ffffff',
                    borderTopWidth: 1,
                    borderTopColor: '#f0f0f0',
                    height: 65,
                    paddingBottom: 12,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: '#4B184C',
                tabBarInactiveTintColor: '#64748b',
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                }
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Explore"
                component={ExploreScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Events"
                component={EventsScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Feed"
                component={FeedScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Welcome"
                    screenOptions={{ headerShown: false }}
                >
                    {/* Auth Screens */}
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Signup" component={SignupScreen} />
                    <Stack.Screen name="Terms" component={TermsScreen} />

                    {/* Main App */}
                    <Stack.Screen name="MainTabs" component={TabNavigator} />
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
                    <Stack.Screen name="Rewards" component={RewardsScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
