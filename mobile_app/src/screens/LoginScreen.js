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
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import axios from 'axios';
import { API_BASE_URL } from '../api/config';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');

const googleRedirectUri = makeRedirectUri({
    scheme: 'trillsauth',
    preferLocalhost: true
});

const fbRedirectUri = makeRedirectUri({
    scheme: 'trillsauth',
    preferLocalhost: true
});

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

    // Google Auth
    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        // For production (Play Store), you MUST create a separate "Android" Client ID in Google Cloud Console
        // and register the SHA-1 of your signing key.
        androidClientId: '1001936941616-p4bb92evlgvh8bdsokk5s8sm4nodcjd8.apps.googleusercontent.com',
        iosClientId: '1001936941616-m4m2f9bad6edsppqm7dkjp68rtauk7dc.apps.googleusercontent.com',
        webClientId: '1001936941616-m4m2f9bad6edsppqm7dkjp68rtauk7dc.apps.googleusercontent.com',
        redirectUri: googleRedirectUri,
    });

    // Facebook Auth
    const [facebookRequest, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest({
        clientId: '1667532970748314',
        redirectUri: fbRedirectUri,
    });

    React.useEffect(() => {
        if (googleResponse?.type === 'success') {
            const { authentication } = googleResponse;
            handleSocialBackendLogin('google', authentication.accessToken);
        } else if (googleResponse?.type === 'error') {
            console.error('Google Auth Error:', googleResponse.error);
            Alert.alert('Google Auth Error', googleResponse.error?.message || 'Failed to authenticate');
        }
    }, [googleResponse]);

    React.useEffect(() => {
        if (facebookResponse?.type === 'success') {
            const { authentication } = facebookResponse;
            handleSocialBackendLogin('facebook', authentication.accessToken);
        } else if (facebookResponse?.type === 'error') {
            console.error('Facebook Auth Error:', facebookResponse.error);
            Alert.alert('Facebook Auth Error', facebookResponse.error?.message || 'Failed to authenticate');
        }
    }, [facebookResponse]);

    const handleSocialBackendLogin = async (provider, token) => {
        try {
            setIsLoading(true);
            // Fetch user info from provider if needed, or send token to backend
            let userInfoUrl = '';
            if (provider === 'google') {
                userInfoUrl = 'https://www.googleapis.com/userinfo/v2/me';
            } else {
                userInfoUrl = `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`;
            }

            const userInfoRes = await axios.get(userInfoUrl, provider === 'google' ? {
                headers: { Authorization: `Bearer ${token}` }
            } : {});

            const userData = userInfoRes.data;
            const payload = {
                name: userData.name,
                email: userData.email || (provider === 'facebook' ? `${userData.id}@facebook.com` : ''),
                image: provider === 'google' ? userData.picture : userData.picture?.data?.url,
                provider: provider,
                providerId: userData.id
            };

            const response = await axios.post(`${API_BASE_URL}/users/social-auth`, payload);

            if (response.data && response.data.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                navigation.replace('MainTabs');
            } else {
                Alert.alert('Login Failed', 'Failed to synchronize with server');
            }
        } catch (error) {
            console.error(`${provider} login error:`, error);
            Alert.alert('Login Error', `Failed to login with ${provider}`);
        } finally {
            setIsLoading(false);
        }
    };

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
        if (provider === 'Google') {
            googlePromptAsync();
        } else if (provider === 'Facebook') {
            facebookPromptAsync();
        }
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
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </View>
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
                                        activeOpacity={0.8}
                                        style={styles.loginButton}
                                    >
                                        <Animated.View style={[styles.loginButtonContent, { transform: [{ scale: buttonScale }] }]}>
                                            {isLoading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={styles.loginButtonText}>Sign In</Text>
                                            )}
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
                                        activeOpacity={0.8}
                                        style={[styles.loginButton, { marginTop: 16 }]}
                                    >
                                        <Animated.View style={[styles.loginButtonContent, { transform: [{ scale: buttonScale }] }]}>
                                            <Text style={styles.loginButtonText}>
                                                {isOtpSent ? 'Verify OTP' : 'Send OTP'}
                                            </Text>
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
    logoImage: {
        width: '100%',
        height: '100%',
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
        fontSize: 30,
        fontWeight: '900',
        color: '#0f172a',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitleText: {
        fontSize: 16,
        color: '#64748b',
        marginBottom: 28,
        lineHeight: 24,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginBottom: 16,
        paddingHorizontal: 16,
        height: 60,
        borderWidth: 1.5,
        borderColor: '#f1f5f9',
    },
    inputIcon: {
        marginRight: 14,
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
        marginBottom: 24,
        overflow: 'hidden',
        backgroundColor: '#4B184C', // Simple Theme Purple
    },
    loginButtonContent: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 0.5,
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
