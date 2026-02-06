import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Dimensions,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff, User, Phone, AtSign, CheckCircle, XCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// API base URL
import { API_BASE_URL } from '../api/config';

export default function SignupScreen({ navigation }) {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [isLoading, setIsLoading] = useState(false);
    const buttonScale = React.useRef(new Animated.Value(1)).current;

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

    const handleSignup = async () => {
        if (!name || !username || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (!agreedToTerms) {
            Alert.alert('Agreement Required', 'Please read and agree to our Terms & Conditions to proceed.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            setIsLoading(true);
            const signupData = {
                name: name.trim(),
                username: username.toLowerCase().trim(),
                email: email.toLowerCase().trim(),
                password,
                authProvider: 'email'
            };

            if (phone && phone.trim()) {
                signupData.phone = phone.trim();
            }

            const url = `${API_BASE_URL}/users/register`;
            console.log('Final Signup URL:', url);

            const response = await axios.post(url, signupData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 15000
            });

            console.log('Signup success:', response.data);

            if (response.data && response.data.user) {
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

                if (Platform.OS === 'web') {
                    window.alert('Account created successfully!');
                    navigation.replace('MainTabs');
                } else {
                    Alert.alert('Success', 'Account created successfully!', [
                        { text: 'OK', onPress: () => navigation.replace('MainTabs') }
                    ]);
                }
            } else {
                Alert.alert('Registration Failed', 'User data missing from response');
            }
        } catch (error) {
            console.log('Detailed Signup Error:', error);
            const errMsg = error.response?.data?.error || error.message || 'Something went wrong';

            if (Platform.OS === 'web') {
                window.alert('Registration Failed: ' + errMsg);
            } else {
                Alert.alert('Registration Failed', errMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignup = (provider) => {
        if (!agreedToTerms) {
            Alert.alert('Agreement Required', 'Please read and agree to our Terms & Conditions to proceed with social signup.');
            return;
        }
        console.log(`Signup with ${provider}`);
        // Implement social signup logic here
        navigation.replace('MainTabs');
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
                        {/* Header */}
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}
                            >
                                <Text style={styles.backButtonText}>← Back</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Logo Section */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logoSquare}>
                                <Text style={styles.logoEmoji}>🐦</Text>
                            </View>
                            <Text style={styles.appName}>Create Account</Text>
                            <Text style={styles.tagline}>Join Trills today</Text>
                        </View>

                        {/* Signup Form */}
                        <View style={styles.formContainer}>
                            {/* Name Input */}
                            <View style={styles.inputContainer}>
                                <User color="#9CA3AF" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    placeholderTextColor="#9CA3AF"
                                    value={name}
                                    onChangeText={setName}
                                    autoCapitalize="words"
                                />
                            </View>

                            {/* Username Input */}
                            <View style={styles.inputContainer}>
                                <AtSign color="#9CA3AF" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Username"
                                    placeholderTextColor="#9CA3AF"
                                    value={username}
                                    onChangeText={setUsername}
                                    autoCapitalize="none"
                                />
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

                            {/* Phone Input */}
                            <View style={styles.inputContainer}>
                                <Phone color="#9CA3AF" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone Number"
                                    placeholderTextColor="#9CA3AF"
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
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

                            {/* Confirm Password Input */}
                            <View style={styles.inputContainer}>
                                <Lock color="#9CA3AF" size={20} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirm Password"
                                    placeholderTextColor="#9CA3AF"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    style={styles.eyeIcon}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff color="#9CA3AF" size={20} />
                                    ) : (
                                        <Eye color="#9CA3AF" size={20} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Terms and Conditions */}
                            <View style={styles.termsAgreementContainer}>
                                <TouchableOpacity
                                    style={[styles.checkbox, agreedToTerms && styles.checkboxActive]}
                                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                                >
                                    {agreedToTerms && <CheckCircle color="#fff" size={14} />}
                                </TouchableOpacity>
                                <Text style={styles.termsText}>
                                    I agree to the{' '}
                                    <Text
                                        style={styles.termsLink}
                                        onPress={() => navigation.navigate('Terms')}
                                    >
                                        Terms & Conditions
                                    </Text>
                                    {' '}and{' '}
                                    <Text
                                        style={styles.termsLink}
                                        onPress={() => navigation.navigate('PrivacyPolicy')}
                                    >
                                        Privacy Policy
                                    </Text>
                                    {' '}of using Trills.
                                </Text>
                            </View>

                            {/* Signup Button */}
                            <TouchableOpacity
                                onPress={handleSignup}
                                onPressIn={() => animateButton(0.95)}
                                onPressOut={() => animateButton(1)}
                                activeOpacity={1}
                                style={{ marginBottom: 20 }}
                            >
                                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                                    <LinearGradient
                                        colors={['#C026D3', '#701A75']}
                                        style={styles.signupButtonGradient}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.signupButtonText}>Create Account</Text>
                                        )}
                                    </LinearGradient>
                                </Animated.View>
                            </TouchableOpacity>

                            {/* Divider */}
                            <View style={styles.dividerContainer}>
                                <View style={styles.divider} />
                                <Text style={styles.dividerText}>or sign up with</Text>
                                <View style={styles.divider} />
                            </View>

                            {/* Social Signup Buttons */}
                            <View style={styles.socialContainer}>
                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#FDF4FF', borderColor: '#FBCFE8' }]}
                                    onPress={() => handleSocialSignup('Google')}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.socialIconContainer, { backgroundColor: '#4B184C' }]}>
                                        <Text style={[styles.socialIcon, { color: '#ffffff' }]}>G</Text>
                                    </View>
                                    <Text style={[styles.socialButtonText, { color: '#4B184C' }]}>Google</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.socialButton, { backgroundColor: '#FDF4FF', borderColor: '#FBCFE8' }]}
                                    onPress={() => handleSocialSignup('Facebook')}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.socialIconContainer, { backgroundColor: '#4B184C' }]}>
                                        <Text style={[styles.socialIcon, { color: '#ffffff' }]}>f</Text>
                                    </View>
                                    <Text style={[styles.socialButtonText, { color: '#4B184C' }]}>Facebook</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Login Link */}
                            <View style={styles.loginContainer}>
                                <Text style={styles.loginText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.loginLink}>Sign In</Text>
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
        paddingVertical: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        paddingTop: 40,
        marginBottom: 20,
    },
    backButton: {
        paddingVertical: 8,
    },
    backButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    logoSquare: {
        width: 80,
        height: 80,
        borderRadius: 18,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 12,
        overflow: 'hidden',
    },
    logoEmoji: {
        fontSize: 48,
    },
    appName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
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
        marginBottom: 20,
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
    termsAgreementContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
        paddingHorizontal: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: '#4B184C',
        borderColor: '#4B184C',
    },
    termsText: {
        fontSize: 13,
        color: '#6B7280',
        flex: 1,
        lineHeight: 18,
    },
    termsLink: {
        color: '#7B2D7E',
        fontWeight: '700',
    },
    signupButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    signupButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    signupButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
        marginBottom: 20,
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
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginText: {
        color: '#6B7280',
        fontSize: 14,
    },
    loginLink: {
        color: '#7B2D7E',
        fontSize: 14,
        fontWeight: 'bold',
    },
});
