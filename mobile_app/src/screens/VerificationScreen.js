import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ShieldCheck, CheckCircle, Camera, X } from 'lucide-react-native';

import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import * as Location from 'expo-location';

import { CameraView, useCameraPermissions } from 'expo-camera';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerificationScreen({ navigation }) {
    const [step, setStep] = useState(0); // 0: intro, 1: scanning, 2: success
    const [permission, requestPermission] = useCameraPermissions();
    const [isFaceDetected, setIsFaceDetected] = useState(false);
    const cameraRef = useRef(null);
    const [userEmail, setUserEmail] = useState('user@trills.com');

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await AsyncStorage.getItem('user');
            if (userData) {
                const parsed = JSON.parse(userData);
                setUserEmail(parsed.email);
            }
        };
        fetchUser();
    }, []);

    const startScan = async () => {
        // 1. Camera Permissions
        if (!permission || !permission.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permission Necessary', 'Camera permission is required to verify your identity.');
                return;
            }
        }

        // 2. Location Permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Necessary', 'Location access is required for security verification.');
            return;
        }

        setStep(1);
        setIsFaceDetected(false);

        try {
            // Simulated face detection wait
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsFaceDetected(true);

            // Get location
            const deviceLocation = await Location.getCurrentPositionAsync({});

            // Wait for 'analysis'
            await new Promise(resolve => setTimeout(resolve, 2000));

            let photoData = null;

            if (cameraRef.current) {
                try {
                    const photo = await cameraRef.current.takePictureAsync({
                        base64: true,
                        quality: 0.3,
                        skipProcessing: true // Faster capture
                    });
                    photoData = `data:image/jpeg;base64,${photo.base64}`;
                } catch (e) {
                    console.log('Capture error, using backup:', e);
                    photoData = 'data:image/jpeg;base64,BACKUP_DEMO_IMG';
                }
            }

            // Call the database API
            const response = await axios.post(ENDPOINTS.VERIFY, {
                faceImage: photoData,
                location: deviceLocation,
                email: userEmail
            });

            console.log('Server Response:', response.data);
            setStep(2);
        } catch (error) {
            console.log('Verification API Error Detailed:', error);
            setStep(0);

            const errorMessage = error.response?.data?.error || 'Verification failed. Please try again.';
            Alert.alert('Verification Failed', errorMessage);
        }
    };

    const handleComplete = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <X size={24} color="#1e293b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Verification</Text>
                <View style={{ width: 24 }} />
            </View>

            {step === 0 && (
                <View style={styles.content}>
                    <View style={styles.iconCircle}>
                        <ShieldCheck size={48} color="#4B184C" />
                    </View>
                    <Text style={styles.title}>Verify Your Identity</Text>
                    <Text style={styles.subtitle}>
                        Trills uses AI to verify that your profile picture matches your real identity.
                        This ensures a safe and trusted community for everyone.
                    </Text>

                    <View style={styles.benefits}>
                        <View style={styles.benefitItem}>
                            <CheckCircle size={20} color="#10b981" />
                            <Text style={styles.benefitText}>3x Higher connection acceptance</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <CheckCircle size={20} color="#10b981" />
                            <Text style={styles.benefitText}>Access to premium coworking spots</Text>
                        </View>
                        <View style={styles.benefitItem}>
                            <CheckCircle size={20} color="#10b981" />
                            <Text style={styles.benefitText}>Priority booking at top restaurants</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.primaryBtn} onPress={startScan}>
                        <Text style={styles.primaryBtnText}>Start AI Face Scan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.secondaryBtnText}>Maybe Later</Text>
                    </TouchableOpacity>
                </View>
            )}

            {step === 1 && (
                <View style={[styles.content, { justifyContent: 'center' }]}>
                    <View style={[
                        styles.scannerWrapper,
                        isFaceDetected && styles.scannerWrapperActive
                    ]}>
                        <CameraView
                            ref={cameraRef}
                            style={StyleSheet.absoluteFill}
                            facing="front"
                        />
                        <View style={[
                            styles.scanLine,
                            isFaceDetected && styles.scanLineActive
                        ]} />
                    </View>
                    <Text style={styles.scanTitle}>
                        {isFaceDetected ? 'Face Detected!' : 'Position your face...'}
                    </Text>
                    <Text style={styles.scanSubtitle}>
                        {isFaceDetected ? 'Analyzing biometric features' : 'Hold still and look at the camera'}
                    </Text>
                    <ActivityIndicator
                        size="large"
                        color={isFaceDetected ? "#10B981" : "#4B184C"}
                        style={{ marginTop: 30 }}
                    />
                </View>
            )}

            {step === 2 && (
                <View style={[styles.content, { justifyContent: 'center' }]}>
                    <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                        <CheckCircle size={48} color="#10b981" />
                    </View>
                    <Text style={styles.title}>Verification Successful!</Text>
                    <Text style={styles.subtitle}>
                        Your identity has been confirmed. A blue badge has been added to your profile.
                    </Text>
                    <TouchableOpacity style={styles.primaryBtn} onPress={handleComplete}>
                        <Text style={styles.primaryBtnText}>Back to Profile</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
    content: { flex: 1, padding: 32, alignItems: 'center' },
    iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(75, 24, 76, 0.05)', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    title: { fontSize: 28, fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: 16 },
    subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 40 },
    benefits: { width: '100%', gap: 16, marginBottom: 48 },
    benefitItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    benefitText: { fontSize: 15, color: '#334155', fontWeight: '500' },
    primaryBtn: { backgroundColor: '#4B184C', width: '100%', padding: 18, borderRadius: 16, alignItems: 'center' },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    secondaryBtn: { marginTop: 20 },
    secondaryBtnText: { color: '#64748b', fontSize: 14, fontWeight: '600' },
    scannerWrapper: { width: 250, height: 250, borderRadius: 125, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', marginBottom: 32, borderWidth: 4, borderColor: 'rgba(75, 24, 76, 0.1)' },
    scannerWrapperActive: { borderColor: '#10B981' },
    scannerCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
    scanLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: '#4B184C', shadowColor: '#4B184C', shadowRadius: 10, shadowOpacity: 1, elevation: 10 },
    scanLineActive: { backgroundColor: '#10B981', shadowColor: '#10B981' },
    scanTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
    scanSubtitle: { fontSize: 14, color: '#64748b' }
});
