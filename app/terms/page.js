'use client';

export default function TermsPage() {
    return (
        <div className="container animate-fade-in" style={{ paddingTop: '60px', paddingBottom: '100px', maxWidth: '800px' }}>
            <h1 className="title-font" style={{ fontSize: '3rem', marginBottom: '40px' }}>Terms & Conditions</h1>

            <div className="glass-card" style={{ padding: '40px', lineHeight: '1.6', color: 'var(--text-main)' }}>
                <p style={{ marginBottom: '20px', color: 'var(--text-muted)' }}>Last Updated: January 24, 2026</p>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
                    <p>By accessing and using Trills, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>2. Booking & Cancellations</h2>
                    <p>Trills acts as a platform to facilitate bookings between users and venues (Restaurants & Co-working spaces). Each venue has its own cancellation policy which will be displayed at the time of booking.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>3. User Conduct</h2>
                    <p>Users must provide accurate information during profile creation. Any misuse of the platform, including fraudulent bookings or harassment of other community members, will lead to account termination.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>4. Venue Responsibilities</h2>
                    <p>Venues are responsible for keeping their availability and hours updated via the Admin Portal. Trills is not liable for discrepancies in real-time seat availability if not managed correctly by the venue.</p>
                </section>

                <section style={{ marginBottom: '30px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.5rem', marginBottom: '15px' }}>5. Limitation of Liability</h2>
                    <p>Trills is not responsible for the quality of services provided by the venues or for any incidents occurring during the utilization of the booking.</p>
                </section>
            </div>
        </div>
    );
}
