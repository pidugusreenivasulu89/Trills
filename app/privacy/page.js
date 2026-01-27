'use client';

export default function PrivacyPage() {
    return (
        <div className="container animate-fade-in" style={{ paddingTop: '60px', paddingBottom: '100px', maxWidth: '800px' }}>
            <h1 className="title-font" style={{ fontSize: '3rem', marginBottom: '40px' }}>Privacy Policy</h1>

            <div className="glass-card" style={{ padding: '40px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Last Updated: January 24, 2026</p>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>1. Information We Collect</h2>
                    <p>We collect information you provide directly to us (name, designation, interests) and automatic location data if permitted, to enhance your personalized booking experience.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>2. How We Use Data</h2>
                    <p>Your data is used to suggest relevant restaurants and coworking spaces, manage your bookings, and build your social identity on the Trills community feed.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>3. Data Sharing</h2>
                    <p>We share necessary booking details with the partner venues you select. We do not sell your personal data to third-party advertisers.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>4. Security</h2>
                    <p>We implement industry-standard security measures to protect your information. Please ensure your social login credentials (Google/Facebook/Apple) are kept secure.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>5. Your Rights</h2>
                    <p>You can request to delete your profile and booking history at any time by contacting our support team.</p>
                </section>
            </div>
        </div>
    );
}
