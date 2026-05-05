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
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
// Native SDKs only for Play Store

WebBrowser.maybeCompleteAuthSession();

import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const { width, height } = Dimensions.get('window');

// Native SDKs don't require manual redirect URI management here

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [isLoading, setIsLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const buttonScale = useRef(new Animated.Value(1)).current;

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isPhoneLogin, setIsPhoneLogin] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const otpInputs = useRef([]);

    // Expo Google Auth Request - Corrected Client IDs
    const [request, response, promptAsync] = Google.useAuthRequest({
        androidClientId: "1001936941616-mcde8fevdm089p65p5jch23efdgsq158.apps.googleusercontent.com",
        iosClientId: "1001936941616-m4m2f9bad6edsppqm7dkjp68rtauk7dc.apps.googleusercontent.com",
        // Do NOT use iosClientId as webClientId - they are different types.
        // If you have a Web Client ID from Google Console, add it here.
        scheme: "trillsauth",
    });

    // Configure Google Sign-In
    React.useEffect(() => {
        GoogleSignin.configure({
            // IMPORTANT: Use the "Web Application" client ID here, NOT the iOS or Android one.
            webClientId: '1001936941616-m4m2f9bad6edsppqm7dkjp68rtauk7dc.apps.googleusercontent.com', 
            offlineAccess: true, 
        });
    }, []);

    // Unified handleResponse replaced by direct button handlers for native SDK

    // Facebook Auth is now handled directly by LoginManager (native)
    // No need for useAuthRequest hook here

    // Consolidate response handling
    // No useEffect needed for native SDK flow

    // Facebook Response useEffect removed as it's now handled by the native Promise in handleSocialLogin

    const handleSocialBackendLogin = async (provider, token) => {
        try {
            console.log(`[SocialAuth] Starting backend sync for ${provider}...`);
            setIsLoading(true);

            let userInfoUrl = '';
            if (provider === 'google') {
                userInfoUrl = 'https://www.googleapis.com/userinfo/v2/me';
            } else {
                // Facebook Graph API
                userInfoUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${token}`;
            }

            console.log(`[SocialAuth] Fetching user info from ${provider}...`);
            const userInfoRes = await axios.get(userInfoUrl, provider === 'google' ? {
                headers: { Authorization: `Bearer ${token}` }
            } : {});

            const userData = userInfoRes.data;
            console.log(`[SocialAuth] Successfully fetched ${provider} user data:`, JSON.stringify(userData).substring(0, 100));

            // Validate we got at least an ID
            if (!userData.id) {
                console.error(`[SocialAuth] No ${provider} ID found in response`);
                throw new Error(`Failed to retrieve user ID from ${provider}`);
            }

            const payload = {
                name: userData.name || 'User',
                email: userData.email || (provider === 'facebook' ? `${userData.id}@facebook.com` : ''),
                image: provider === 'google' ? userData.picture : userData.picture?.data?.url,
                provider: provider,
                providerId: userData.id
            };

            if (!payload.email || payload.email === '@facebook.com') {
                console.error('[SocialAuth] Invalid email in payload:', payload.email);
                throw new Error('Email is required but was not provided by the social platform');
            }

            console.log('[SocialAuth] Sending payload to backend:', payload.email);
            const response = await axios.post(`${API_BASE_URL}/users/social-auth`, payload, {
                timeout: 10000,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data && response.data.user) {
                console.log('[SocialAuth] Sync successful, saving user and navigating...');
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Small delay to ensure state is settled before navigation
                setTimeout(() => {
                    navigation.replace('MainTabs');
                }, 100);
            } else {
                console.error('[SocialAuth] Backend response missing user object:', response.data);
                throw new Error('Server response was successful but user data is missing');
            }
        } catch (error) {
            console.error(`[SocialAuth] ${provider} login sync failed:`, error);
            let errorMsg = 'Server synchronization failed';
            
            if (error.response) {
                console.log('[SocialAuth] Server Error Data:', error.response.data);
                errorMsg = error.response.data?.error || error.response.data?.message || `Server error (${error.response.status})`;
            } else if (error.request) {
                errorMsg = 'No response from server. Please check your network.';
            } else {
                errorMsg = error.message;
            }
            
            Alert.alert('Login Error', `${provider} login sync failed: ${errorMsg}`);
        } finally {
            setLoadingProvider(null);
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
        if (response?.type === 'success') {
            const { authentication } = response;
            console.log('Google Auth Session success:', authentication.accessToken ? 'Yes' : 'No');
            handleSocialBackendLogin('google', authentication.accessToken);
        } else if (response?.type === 'error') {
            console.error('Google Auth Session error:', response.error);
            Alert.alert('Login Error', 'Failed to sign in with Google');
            setLoadingProvider(null);
        }
    }, [response]);

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
                
                // Small delay ensures storage and UI states are settled before navigation
                setTimeout(() => {
                    navigation.replace('MainTabs');
                }, 100);
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

    const handleSocialLogin = async (provider) => {
        if (provider === 'Google') {
            try {
                setLoadingProvider('google');
                
                // Now that Error 10 is gone, we can use the much more reliable Native SDK
                console.log('Starting Native Google Sign-In...');
                await GoogleSignin.hasPlayServices();
                const userInfo = await GoogleSignin.signIn();
                console.log('Native Google Sign-In Success:', userInfo.user.email);
                
                const tokens = await GoogleSignin.getTokens();
                handleSocialBackendLogin('google', tokens.accessToken);
                
                /* Backup: Expo Auth Session flow
                await promptAsync();
                */
            } catch (error) {
                setLoadingProvider(null);
                console.error('Google Auth Error:', error);
                
                let detailedError = error.message || 'Unknown error';
                if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                    return; // User cancelled
                } else if (error.code === statusCodes.IN_PROGRESS) {
                    detailedError = 'Sign in already in progress';
                } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                    detailedError = 'Play Services not available or outdated';
                } else {
                    // Error 10 is most often a package name / SHA-1 mismatch on Android.
                    detailedError = `Code: ${error.code || 'None'} - ${error.message}. This is usually Google Developer Error 10. Verify package name 'in.trills.socialvibe' and register the correct SHA-1 in Google Console: debug builds use 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25, release builds use 60:03:82:FA:F2:1B:58:6E:0A:A1:73:79:BA:3B:53:E7:24:19:49:F1. Also confirm the webClientId is a Web Application client ID.`;
                }
                
                Alert.alert('Login Error', `Failed to initialize Google login session:\n\n${detailedError}`);
            }
        } else if (provider === 'Facebook') {
            try {
                setLoadingProvider('facebook');
                const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
                if (result.isCancelled) {
                    setLoadingProvider(null);
                    console.log('Facebook Sign-In Cancelled');
                } else {
                    const data = await AccessToken.getCurrentAccessToken();
                    if (data?.accessToken) {
                        console.log('Facebook Sign-In Success token:', data.accessToken.substring(0, 10) + '...');
                        handleSocialBackendLogin('facebook', data.accessToken.toString());
                    } else {
                        throw new Error('Could not get Facebook access token');
                    }
                }
            } catch (error) {
                setLoadingProvider(null);
                console.error('Facebook Sign-In Error:', error);
                Alert.alert('Login Error', error.message || 'Failed to sign in with Facebook');
            }
        }
    };

    const handleSendOtp = async () => {
        if (!phone) {
            Alert.alert('Error', 'Please enter your phone number');
            return;
        }
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_BASE_URL}/auth/otp/generate`, { phone });
            
            if (response.data) {
                setIsOtpSent(true);
                Alert.alert('Success', `OTP sent successfully!${response.data.otp ? ' (Dev: ' + response.data.otp + ')' : ''}`);
            }
        } catch (error) {
            console.error('Send OTP Error:', error);
            const msg = error.response?.data?.error || 'Failed to send OTP. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            Alert.alert('Error', 'Please enter the 6-digit OTP');
            return;
        }
        try {
            setIsLoading(true);
            console.log('Verifying OTP for:', phone);
            
            const response = await axios.post(`${API_BASE_URL}/auth/otp/verify`, { 
                phone, 
                otp 
            });

            if (response.data && response.data.user) {
                console.log('OTP Verified, saving user data...');
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Small delay to ensure storage is settled
                setTimeout(() => {
                    navigation.replace('MainTabs');
                }, 100);
            } else {
                Alert.alert('Error', 'Invalid user data received from server');
            }
        } catch (error) {
            console.error('Verify OTP Error:', error);
            const msg = error.response?.data?.error || 'Incorrect OTP. Please check and try again.';
            Alert.alert('Verification Failed', msg);
        } finally {
            setIsLoading(false);
        }
    };

    const renderOtpInputs = () => {
        return (
            <View style={styles.otpWrapper}>
                <Text style={styles.otpLabel}>Enter the 6-digit verification code</Text>
                
                <View style={[styles.inputContainer, { width: '100%', borderBottomWidth: 2, borderBottomColor: '#4B184C' }]}>
                    <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
                    <TextInput
                        style={[styles.input, { fontSize: 24, letterSpacing: 10, fontWeight: 'bold' }]}
                        placeholder="000000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={(value) => setOtp(value.replace(/[^0-9]/g, ''))}
                        autoComplete="sms-otp"
                        textContentType="oneTimeCode"
                        autoFocus={true}
                        textAlign="center"
                    />
                </View>

                <TouchableOpacity 
                    onPress={() => {
                        setOtp('');
                        setIsOtpSent(false);
                    }}
                    style={styles.resendContainer}
                >
                    <Text style={styles.resendText}>Wrong number? <Text style={styles.resendLink}>Change</Text></Text>
                </TouchableOpacity>
            </View>
        );
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
                                            disabled={loadingProvider !== null || isLoading}
                                        >
                                            <View style={[styles.socialIconContainer, { backgroundColor: '#4B184C' }]}>
                                                {loadingProvider === 'google' ? (
                                                    <ActivityIndicator size="small" color="#ffffff" />
                                                ) : (
                                                    <Text style={[styles.socialIcon, { color: '#ffffff' }]}>G</Text>
                                                )}
                                            </View>
                                            <Text style={[styles.socialButtonText, { color: '#4B184C' }]}>Google</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.socialButton, { backgroundColor: '#FDF4FF', borderColor: '#FBCFE8' }]}
                                            onPress={() => handleSocialLogin('Facebook')}
                                            activeOpacity={0.7}
                                            disabled={loadingProvider !== null || isLoading}
                                        >
                                            <View style={[styles.socialIconContainer, { backgroundColor: '#4B184C' }]}>
                                                {loadingProvider === 'facebook' ? (
                                                    <ActivityIndicator size="small" color="#ffffff" />
                                                ) : (
                                                    <Text style={[styles.socialIcon, { color: '#ffffff' }]}>f</Text>
                                                )}
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
                                    <TouchableOpacity 
                                        style={styles.forgotPassword}
                                        onPress={() => navigation.navigate('ForgotPassword')}
                                    >
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

                                     {isOtpSent && renderOtpInputs()}

                                    <TouchableOpacity
                                        onPress={isOtpSent ? handleVerifyOtp : handleSendOtp}
                                        onPressIn={() => animateButton(0.95)}
                                        onPressOut={() => animateButton(1)}
                                        activeOpacity={0.8}
                                        style={[styles.loginButton, { marginTop: 16 }]}
                                        disabled={isLoading}
                                    >
                                        <Animated.View style={[styles.loginButtonContent, { transform: [{ scale: buttonScale }] }]}>
                                            {isLoading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text style={styles.loginButtonText}>
                                                    {isOtpSent ? 'Verify & Continue' : 'Get OTP'}
                                                </Text>
                                            )}
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
    otpWrapper: {
        marginBottom: 20,
        alignItems: 'center',
        width: '100%',
    },
    otpLabel: {
        fontSize: 14,
        color: '#64748b',
        marginBottom: 16,
        fontWeight: '500',
    },
    resendContainer: {
        marginTop: 16,
    },
    resendText: {
        fontSize: 13,
        color: '#64748b',
    },
    resendLink: {
        color: '#7B2D7E',
        fontWeight: '700',
    },
});
