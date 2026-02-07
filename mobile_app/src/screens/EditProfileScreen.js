import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Camera, User, Briefcase, MapPin, AlignLeft, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ENDPOINTS } from '../api/config';
import { Alert } from 'react-native';

export default function EditProfileScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [designation, setDesignation] = useState('');
    const [location, setLocation] = useState('');
    const [bio, setBio] = useState('');
    const [avatar, setAvatar] = useState('https://i.pravatar.cc/150?u=me');

    React.useEffect(() => {
        const loadUser = async () => {
            try {
                const stored = await AsyncStorage.getItem('user');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setUser(parsed);
                    setName(parsed.name || '');
                    setDesignation(parsed.designation || '');
                    setLocation(parsed.location || '');
                    setBio(parsed.bio || '');
                    // Normalize avatar
                    setAvatar(parsed.avatar || parsed.image || 'https://i.pravatar.cc/150?u=me');
                }
            } catch (e) {
                console.log('Load user error:', e);
            }
        };
        loadUser();
    }, []);

    const handleSave = async () => {
        if (!user?.email) {
            Alert.alert('Error', 'User session not found. Please log in again.');
            return;
        }

        setLoading(true);
        try {
            const updateData = {
                email: user.email,
                name,
                designation,
                location,
                bio,
                avatar,
                image: avatar // Keep consistent
            };

            const response = await axios.patch(ENDPOINTS.PROFILE_UPDATE, updateData, {
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.data.success) {
                // Update local storage
                const updatedUser = { ...user, ...updateData };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

                Alert.alert('Success', 'Profile updated successfully! ✨', [
                    { text: 'OK', onPress: () => navigation.goBack() }
                ]);
            } else {
                Alert.alert('Update Failed', response.data.error || 'Could not sync with database.');
            }
        } catch (error) {
            console.log('Profile Save Error:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Edit Profile</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#4B184C" /> : <Text style={styles.saveText}>Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.avatarSection}>
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                    <TouchableOpacity style={styles.changePicBtn}>
                        <Camera size={16} color="#fff" />
                        <Text style={styles.changePicText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <User size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Designation</Text>
                        <View style={styles.inputWrapper}>
                            <Briefcase size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={designation}
                                onChangeText={setDesignation}
                                placeholder="e.g. Product Designer"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Location</Text>
                        <View style={styles.inputWrapper}>
                            <MapPin size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={location}
                                onChangeText={setLocation}
                                placeholder="e.g. New York, NY"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Bio</Text>
                        <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 12 }]}>
                            <AlignLeft size={18} color="#94a3b8" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                multiline
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9'
    },
    title: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
    cancelText: { color: '#64748b' },
    saveText: { color: '#4B184C', fontWeight: '700' },
    scrollContent: { padding: 24 },
    avatarSection: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16 },
    changePicBtn: {
        backgroundColor: '#4B184C',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8
    },
    changePicText: { color: '#fff', fontSize: 13, fontWeight: '600' },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontWeight: '600', color: '#64748b', marginLeft: 4 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 16,
        paddingHorizontal: 16
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, height: 50, color: '#1e293b', fontSize: 15 }
});
