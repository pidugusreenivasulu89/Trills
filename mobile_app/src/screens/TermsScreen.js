import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { ArrowLeft, ShieldAlert, Scale, UserCheck, Smartphone } from 'lucide-react-native';

export default function TermsScreen({ navigation }) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Terms of Service</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.introBox}>
                    <ShieldAlert size={48} color="#4B184C" strokeWidth={1.5} />
                    <Text style={styles.introTitle}>Legal Agreement</Text>
                    <Text style={styles.introText}>
                        Please read these terms carefully. They contain important information about your legal rights,
                        remedies, and obligations as a member of the Trills community.
                    </Text>
                </View>

                <Section title="1. Acceptance of Terms" icon={<Smartphone size={18} color="#4B184C" />}>
                    By accessing or using Trills (the "App"), you agree to be bound by these Terms and Conditions.
                    If you do not agree to all terms, you must not use the App. We operate as a marketplace platform
                    connecting users with venues and social opportunities.
                </Section>

                <Section title="2. Limitation of Liability" icon={<Scale size={18} color="#4B184C" />}>
                    Trills acts only as a facilitator. We ARE NOT responsible for:
                    {'\n'}• Any physical or psychological harm occurring at third-party venues.
                    {'\n'}• Losses of personal property.
                    {'\n'}• Behavioral disputes between users during "Crush" matches or "Meetups".
                    {'\n'}• Quality of service provided by restaurants, bars, or co-working spaces.
                    {'\n'}All interactions are at your OWN RISK.
                </Section>

                <Section title="3. Verification & Identity" icon={<UserCheck size={18} color="#4B184C" />}>
                    Face verification and Location tagging are mandatory for "Verified Member" status.
                    While we use advanced AI to verify users, we cannot guarantee the absolute identity
                    or safety of any member. Users are encouraged to meet in public places and use caution.
                </Section>

                <Section title="4. Booking & Cancellation" icon={<Smartphone size={18} color="#4B184C" />}>
                    All payments for table bookings are processed by third-party gateways.
                    Refunds are subject to the specific venue's policy. Trills reserves the right
                    to charge a platform fee which is non-refundable in case of user-initiated cancellations.
                </Section>

                <Section title="5. Data Privacy" icon={<ShieldAlert size={18} color="#4B184C" />}>
                    We collect location data and biometric face-mappings for safety and functionality.
                    By using Trills, you consent to our data collection practices as outlined in our
                    Privacy Policy. We do not sell your personal biometric data to third parties.
                </Section>

                <Section title="6. Community Guidelines" icon={<UserCheck size={18} color="#4B184C" />}>
                    Harassment, stalking, or any form of predatory behavior will result in an immediate
                    permanent ban without refund. We maintain a zero-tolerance policy towards hate speech
                    and discrimination.
                </Section>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Last Updated: January 2026</Text>
                    <Text style={styles.footerText}>© 2026 Trills Social Network. All Rights Reserved.</Text>
                </View>

                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.closeBtnText}>I Understand</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const Section = ({ title, icon, children }) => (
    <View style={styles.section}>
        <View style={styles.sectionHeader}>
            {icon}
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionBody}>{children}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9'
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    scrollContent: { padding: 24 },
    introBox: { alignItems: 'center', marginBottom: 30 },
    introTitle: { fontSize: 22, fontWeight: '800', color: '#1E293B', marginTop: 15 },
    introText: {
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 22
    },
    section: { marginBottom: 25 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
    sectionBody: { fontSize: 14, color: '#475569', lineHeight: 22 },
    footer: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20, alignItems: 'center' },
    footerText: { fontSize: 12, color: '#94A3B8', marginBottom: 5 },
    closeBtn: {
        backgroundColor: '#4B184C',
        marginTop: 30,
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    closeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' }
});
