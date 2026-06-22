import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fingerprint, LockKeyhole } from 'lucide-react-native';
import { USER_STORAGE_KEY } from '../utils/profileSession';

export default function BiometricUnlockScreen({ navigation }) {
    const [isAuthenticating, setIsAuthenticating] = useState(false);

    const unlock = useCallback(async () => {
        setIsAuthenticating(true);
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock Trills',
                cancelLabel: 'Cancel',
                fallbackLabel: 'Use account password',
                disableDeviceFallback: true,
                biometricsSecurityLevel: 'weak',
            });
            if (result.success) {
                navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
            }
        } catch (error) {
            Alert.alert('Biometric unlock unavailable', 'Please use your account password to sign in.');
        } finally {
            setIsAuthenticating(false);
        }
    }, [navigation]);

    const usePassword = async () => {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    useEffect(() => { unlock(); }, [unlock]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.icon}><Fingerprint size={48} color="#4B184C" /></View>
                <Text style={styles.title}>Unlock Trills</Text>
                <Text style={styles.subtitle}>Use your device Face ID, Face Unlock, or fingerprint to continue.</Text>
                {isAuthenticating ? <ActivityIndicator size="large" color="#4B184C" style={styles.spinner} /> : null}
                <TouchableOpacity style={styles.primaryButton} onPress={unlock} disabled={isAuthenticating}>
                    <LockKeyhole size={19} color="#fff" />
                    <Text style={styles.primaryText}>Unlock securely</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={usePassword} disabled={isAuthenticating}>
                    <Text style={styles.secondaryText}>Use password instead</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    icon: { width: 108, height: 108, borderRadius: 54, backgroundColor: '#fdf4ff', alignItems: 'center', justifyContent: 'center', marginBottom: 26 },
    title: { fontSize: 28, fontWeight: '900', color: '#1e293b' },
    subtitle: { color: '#64748b', fontSize: 16, lineHeight: 24, textAlign: 'center', marginTop: 12, marginBottom: 28 },
    spinner: { marginBottom: 22 },
    primaryButton: { width: '100%', backgroundColor: '#4B184C', paddingVertical: 17, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
    primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
    secondaryButton: { paddingVertical: 18, marginTop: 8 },
    secondaryText: { color: '#4B184C', fontSize: 15, fontWeight: '700' },
});
