import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Mail } from 'lucide-react-native';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');

    const handleReset = () => {
        if (!email.trim()) {
            Alert.alert('Email Required', 'Enter the email linked to your Trills account.');
            return;
        }

        Alert.alert(
            'Reset Link Requested',
            'If this email exists on Trills, password reset instructions will be sent shortly.',
            [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
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
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <ArrowLeft size={20} color="#fff" />
                        <Text style={styles.backText}>Back</Text>
                    </TouchableOpacity>

                    <View style={styles.logoContainer}>
                        <View style={styles.logoSquare}>
                            <Image source={require('../../assets/icon.png')} style={styles.logoImage} resizeMode="contain" />
                        </View>
                        <Text style={styles.title}>Reset Password</Text>
                        <Text style={styles.subtitle}>Enter your email and we will guide you back in.</Text>
                    </View>

                    <View style={styles.formContainer}>
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

                        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.85}>
                            <Text style={styles.resetButtonText}>Send Reset Link</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.loginLinkText}>Return to Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        top: 48,
        left: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        zIndex: 2,
    },
    backText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 34,
    },
    logoSquare: {
        width: 84,
        height: 84,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 18,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.82)',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 18,
    },
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.96)',
        borderRadius: 28,
        padding: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: 16,
        marginBottom: 18,
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
    resetButton: {
        backgroundColor: '#4B184C',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginLinkText: {
        color: '#7B2D7E',
        fontSize: 14,
        fontWeight: '800',
    },
});
