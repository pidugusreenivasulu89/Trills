import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import axios from 'axios';

import { API_BASE_URL } from '../api/config';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [isLoading, setIsLoading] = useState(false);
    const buttonScale = useRef(new Animated.Value(1)).current;

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isPhoneLogin, setIsPhoneLogin] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);

    const animateButton = (scale) => {
        Animated.spring(buttonScale, {
            toValue: scale,
            useNativeDriver: true,
            speed: 50,
            bounciness: 10,
        }).start();
    };

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }
        try {
            setIsLoading(true);
            const url = `${API_BASE_URL}/users/login`;
            console.log('Login attempt at:', url);

            const response = await axios.post(url, {
                email: email.toLowerCase().trim(),
                password
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            });

            console.log('Login success data:', response.data);

            if (response.data && response.data.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                navigation.replace('MainTabs');
            } else {
                Alert.alert('Login Failed', 'User data missing from response');
            }
        } catch (error) {
            console.log('Detailed Login Error:', error);
            if (error.response) {
                Alert.alert('Login Failed', error.response.data.error || 'Invalid credentials');
            } else if (error.request) {
                Alert.alert('Network Error', 'The server is currently unreachable. Please check your internet connection and try again later.');
            } else {
                Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        console.log(`Login with ${provider}`);
        navigation.replace('MainTabs');
    };

    const handleSendOtp = async () => {
        if (!phone) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone }),
            });
            const data = await response.json();
            if (response.ok) {
                setIsOtpSent(true);
                Alert.alert('Success', `OTP sent! (Dev: ${data.otp})`); // Showing OTP for dev convenience
            } else {
                Alert.alert('Error', data.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to send OTP');
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert('Error', 'Please enter the OTP');
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/auth/otp/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp }),
            });
            const data = await response.json();
            if (response.ok) {
                await AsyncStorage.setItem('user', JSON.stringify(data.user));
                navigation.replace('MainTabs');
            } else {
                Alert.alert('Error', data.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to verify OTP');
        }
    };



    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={['#4B184C', '#7B2D7E', '#4B184C']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View
                        style={[
                            styles.content,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Logo Section */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoSquare}>
                                <Text style={styles.logoEmoji}>🐦</Text>
                            </View>
                            <Text style={styles.appName}>Trills</Text>
                            <Text style={styles.tagline}>Connect. Share. Celebrate.</Text>
                        </View>

                        {/* Login Form */}
                        <View style={styles.formContainer}>
                            <Text style={styles.welcomeText}>Welcome Back!</Text>
                            <Text style={styles.subtitleText}>Sign in to continue</Text>

                            {/* Toggle Login Method */}
                            <View style={styles.toggleContainer}>
                                <TouchableOpacity
                                    onPress={() => setIsPhoneLogin(false)}
                                    style={[styles.toggleButton, !isPhoneLogin && styles.toggleButtonActive]}
                                >
                                    <Text style={[styles.toggleText, !isPhoneLogin && styles.toggleTextActive]}>Email</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setIsPhoneLogin(true)}
                                    style={[styles.toggleButton, isPhoneLogin && styles.toggleButtonActive]}
                                >
                                    <Text style={[styles.toggleText, isPhoneLogin && styles.toggleTextActive]}>Mobile</Text>
                                </TouchableOpacity>
                            </View>

                            {!isPhoneLogin ? (
                                <>
                                    {/* Email Login UI */}
                                    {/* Social Login Buttons - Highlighted */}
                                    <View style={styles.socialContainer}>
                                        <TouchableOpacity
                                            style={[styles.socialButton, { backgroundColor: '#FDF4FF', borderColor: '#FBCFE8' }]}
                                            onPress={() => handleSocialLogin('Google')}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.socialIconContainer, { backgroundColor: '#4B184C' }]}>
                                                <Text style={[styles.socialIcon, { color: '#ffffff' }]}>G</Text>
                                            </View>
                                            <Text style={[styles.socialButtonText, { color: '#4B184C' }]}>Google</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.socialButton, { backgroundColor: '#FDF4FF', borderColor: '#FBCFE8' }]}
                                            onPress={() => handleSocialLogin('Facebook')}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.socialIconContainer, { backgroundColor: '#4B184C' }]}>
                                                <Text style={[styles.socialIcon, { color: '#ffffff' }]}>f</Text>
                                            </View>
                                            <Text style={[styles.socialButtonText, { color: '#4B184C' }]}>Facebook</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.socialButton, { backgroundColor: '#FDF4FF', borderColor: '#FBCFE8' }]}
                                            onPress={() => handleSocialLogin('LinkedIn')}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.socialIconContainer, { backgroundColor: '#4B184C' }]}>
                                                <Text style={[styles.socialIcon, { color: '#ffffff' }]}>in</Text>
                                            </View>
                                            <Text style={[styles.socialButtonText, { color: '#4B184C' }]}>LinkedIn</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {/* Divider */}
                                    <View style={styles.dividerContainer}>
                                        <View style={styles.divider} />
                                        <Text style={styles.dividerText}>or use email</Text>
                                        <View style={styles.divider} />
                                    </View>

                                    {/* Email Input */}
                                    <View style={styles.inputContainer}>
                                        <Mail color="#9CA3AF" size={20} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Email"
                                            placeholderTextColor="#9CA3AF"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    {/* Password Input */}
                                    <View style={styles.inputContainer}>
                                        <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Password"
                                            placeholderTextColor="#9CA3AF"
                                            value={password}
                                            onChangeText={setPassword}
                                            secureTextEntry={!showPassword}
                                        />
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeIcon}
                                        >
                                            {showPassword ? (
                                                <EyeOff color="#9CA3AF" size={20} />
                                            ) : (
                                                <Eye color="#9CA3AF" size={20} />
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    {/* Forgot Password */}
                                    <TouchableOpacity style={styles.forgotPassword}>
                                        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                    </TouchableOpacity>

                                    {/* Login Button */}
                                    <TouchableOpacity
                                        onPress={handleLogin}
                                        onPressIn={() => animateButton(0.95)}
                                        onPressOut={() => animateButton(1)}
                                        activeOpacity={1}
                                        style={{ marginBottom: 24 }}
                                    >
                                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                                            <LinearGradient
                                                colors={['#C026D3', '#701A75']} // Animated Purple Theme
                                                style={styles.loginButtonGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                {isLoading ? (
                                                    <ActivityIndicator color="#fff" />
                                                ) : (
                                                    <Text style={styles.loginButtonText}>Sign In</Text>
                                                )}
                                            </LinearGradient>
                                        </Animated.View>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    {/* Phone/OTP Login UI */}
                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Phone Number"
                                            placeholderTextColor="#9CA3AF"
                                            value={phone}
                                            onChangeText={setPhone}
                                            keyboardType="phone-pad"
                                            editable={!isOtpSent}
                                        />
                                    </View>

                                    {isOtpSent && (
                                        <View style={styles.inputContainer}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="Enter OTP"
                                                placeholderTextColor="#9CA3AF"
                                                value={otp}
                                                onChangeText={setOtp}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                                        onPressIn={() => animateButton(0.95)}
                                        onPressOut={() => animateButton(1)}
                                        activeOpacity={1}
                                        style={{ marginBottom: 24, marginTop: 16 }}
                                    >
                                        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                                            <LinearGradient
                                                colors={['#C026D3', '#701A75']}
                                                style={styles.loginButtonGradient}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                            >
                                                <Text style={styles.loginButtonText}>
                                                    {isOtpSent ? 'Verify OTP' : 'Send OTP'}
                                                </Text>
                                            </LinearGradient>
                                        </Animated.View>
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Sign Up Link */}
                            <View style={styles.signupContainer}>
                                <Text style={styles.signupText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                    <Text style={styles.signupLink}>Sign Up</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoSquare: {
        width: 100,
        height: 100,
        borderRadius: 20,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 16,
        overflow: 'hidden',
    },
    logoEmoji: {
        fontSize: 60,
    },
    appName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
    formContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitleText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#7B2D7E',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    loginButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    dividerText: {
        color: '#6B7280',
        paddingHorizontal: 16,
        fontSize: 14,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    socialButton: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    socialIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    facebookIcon: {
        backgroundColor: '#1877F2',
    },
    appleIcon: {
        backgroundColor: '#000000',
    },
    socialIcon: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4285F4',
    },
    socialButtonText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '600',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    signupText: {
        color: '#6B7280',
        fontSize: 14,
    },
    signupLink: {
        color: '#7B2D7E',
        fontSize: 14,
        fontWeight: 'bold',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    toggleTextActive: {
        color: '#7B2D7E',
        fontWeight: 'bold',
    },
});
