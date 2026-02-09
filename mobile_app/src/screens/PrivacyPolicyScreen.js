import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Linking
} from 'react-native';
import { ArrowLeft, ShieldCheck, Database, Info, UserCheck, Share2, Lock, Clock, User, Baby, RefreshCcw, Mail } from 'lucide-react-native';

export default function PrivacyPolicyScreen({ navigation }) {
    const handleEmailPress = () => {
        Linking.openURL('mailto:connect@trills.in');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#1E293B" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.introBox}>
                    <ShieldCheck size={48} color="#4B184C" strokeWidth={1.5} />
                    <Text style={styles.introTitle}>Privacy Matters</Text>
                    <Text style={styles.introText}>
                        At Trills Media and Entertainment Pvt. Ltd., your trust matters to us. This policy explains how we handle your data.
                    </Text>
                </View>

                <Section title="1. About Trills" icon={<ShieldCheck size={18} color="#4B184C" />}>
                    Trills Media and Entertainment Pvt. Ltd. is an Indian company focused on authentic user experiences and safe online interactions.
                    {'\n'}Registered Office: NO: 5, Srinivas Nilaya, Paramahamsa Road, Mysuru – 570020
                </Section>

                <Section title="2. Information We Collect" icon={<Database size={18} color="#4B184C" />}>
                    We collect personal details (name, number, email) and identity verification data (facial images/selfies) to ensure platform integrity. We only collect what is necessary for security and verification.
                </Section>

                <Section title="3. Why We Collect This" icon={<Info size={18} color="#4B184C" />}>
                    Your information is used strictly for verifying identity, preventing fraudulent accounts, and maintaining a safe environment. We do NOT use Advertising Identifiers (IDFA/AAID) or track your activity across other apps. We also collect engagement data (Trills Miles) solely to provide loyalty rewards and incentives.
                </Section>

                <Section title="4. Face Verification" icon={<UserCheck size={18} color="#4B184C" />}>
                    Facial data is used solely for identity verification. It is encrypted during transmission and storage, with strictly limited access. It is never used for marketing or analytics.
                </Section>

                <Section title="5. Data Sharing" icon={<Share2 size={18} color="#4B184C" />}>
                    We do not sell or trade your personal information. Data is shared only with trusted service providers for infrastructure support or when required by law.
                </Section>

                <Section title="6. Data Security" icon={<Lock size={18} color="#4B184C" />}>
                    We employ secure servers, encrypted storage, and regular monitoring to protect your information from unauthorized access.
                </Section>

                <Section title="7. Data Retention" icon={<Clock size={18} color="#4B184C" />}>
                    We retain data only as long as needed for verification or legal compliance. Once no longer necessary, data is securely deleted or anonymized.
                </Section>

                <Section title="8. Your Rights" icon={<User size={18} color="#4B184C" />}>
                    You have the right to access, correct, or request deletion of your data and account, subject to legal obligations.
                </Section>

                <Section title="9. Child Safety and CSAE Policy" icon={<Baby size={18} color="#4B184C" />}>
                    Trills, developed and published by Trills Media and Entertainment Private Limited, is committed to maintaining a safe and secure environment for all users. We have a zero-tolerance policy toward Child Sexual Abuse and Exploitation (CSAE).
                    {'\n\n'}
                    <Text style={{ fontWeight: '700' }}>Prohibited Content and Behavior</Text>
                    {'\n'}
                    Trills strictly prohibits any content, activity, or behavior that involves or promotes:
                    {'\n'}• Child sexual abuse or exploitation in any form
                    {'\n'}• Creation, distribution, possession, or consumption of child sexual abuse material (CSAM)
                    {'\n'}• Grooming, sexual solicitation, or inappropriate interaction with minors
                    {'\n'}• Any activity that endangers or exploits children sexually
                    {'\n\n'}
                    <Text style={{ fontWeight: '700' }}>Enforcement and Reporting</Text>
                    {'\n'}
                    If CSAE-related content or behavior is identified, Trills will take immediate action, which may include:
                    {'\n'}• Removal of the offending content
                    {'\n'}• Suspension or permanent termination of user accounts
                    {'\n'}• Reporting to appropriate legal authorities
                    {'\n\n'}
                    Report concerns at: connect@trills.in
                    {'\n\n'}
                    <Text style={{ fontWeight: '700' }}>Commitment to Compliance</Text>
                    {'\n'}
                    Trills is committed to complying with all applicable child safety laws and Google Play policies. The Platform is intended for users 18 years and above.
                </Section>

                <Section title="10. Changes to Policy" icon={<RefreshCcw size={18} color="#4B184C" />}>
                    We may update this policy periodically. Continued use of the platform constitutes acceptance of the revised policy.
                </Section>

                <Section title="11. Contact & Grievance" icon={<Mail size={18} color="#4B184C" />}>
                    For any concerns, you may contact our Grievance Officer at:
                    {'\n'}Email: connect@trills.in
                </Section>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Last Updated: 9 February 2026</Text>
                    <Text style={styles.footerText}>© 2026 Trills Media and Entertainment Pvt. Ltd.</Text>
                </View>

                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.closeBtnText}>I Consent</Text>
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
