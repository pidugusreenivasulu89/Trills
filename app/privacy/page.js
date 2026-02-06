'use client';

export default function PrivacyPage() {
    return (
        <div className="container animate-fade-in" style={{ paddingTop: '60px', paddingBottom: '100px', maxWidth: '900px' }}>
            <h1 className="title-font" style={{ fontSize: '3rem', marginBottom: '10px' }}>Privacy Policy</h1>
            <p style={{ marginBottom: '40px', color: 'var(--text-muted)' }}>Last updated: 6 February 2026</p>

            <div className="glass-card" style={{ padding: '40px', lineHeight: '1.7', color: 'var(--text-main)' }}>
                <p style={{ marginBottom: '30px' }}>
                    At <strong>Trills Media and Entertainment Pvt. Ltd.</strong> ("Trills", "we", "our", "us"), your trust matters to us. This Privacy Policy explains, in clear and simple terms, how we collect, use, store, and protect your personal information when you access or use our mobile application, website, and related services (collectively, the <strong>"Platform"</strong>).
                </p>

                <p style={{ marginBottom: '30px', fontWeight: '500' }}>
                    We are committed to collecting <strong>only what is necessary</strong>, using it <strong>only for legitimate purposes</strong>, and protecting it with strong security practices.
                </p>

                <p style={{ marginBottom: '40px' }}>
                    By using the Platform, you acknowledge that you have read and understood this Privacy Policy and agree to the practices described below.
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '40px 0', opacity: 0.3 }} />

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>1. About Trills</h2>
                    <p>
                        <strong>Trills Media and Entertainment Pvt. Ltd.</strong> is an Indian company engaged in building digital platforms focused on authentic user experiences and safe online interactions.
                    </p>
                    <p style={{ marginTop: '10px' }}>
                        <strong>Registered Office:</strong> NO: 5, Srinivas Nilaya, Paramahamsa Road, Mysuru – 570020<br />
                        <strong>Contact Email:</strong> <a href="mailto:connect@trills.in" style={{ color: 'var(--accent-primary)' }}>connect@trills.in</a>
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>2. Information We Collect</h2>
                    <p style={{ marginBottom: '15px' }}>We intentionally limit data collection to what is required for <strong>user verification, security, and platform integrity</strong>.</p>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px' }}>a. Personal Information</h3>
                    <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
                        <li>Full name</li>
                        <li>Mobile number</li>
                        <li>Email address</li>
                        <li>Basic profile information voluntarily provided by you</li>
                    </ul>

                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '10px' }}>b. Identity & Face Verification Information</h3>
                    <p style={{ marginBottom: '15px' }}>To ensure authenticity and prevent misuse of the Platform, we may collect:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>A facial image or selfie submitted by you for verification</li>
                        <li>Verification-related metadata such as submission time and verification status</li>
                    </ul>
                    <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
                        This information is collected <strong>only with your knowledge and action</strong> and is not used for any purpose beyond verification and safety.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>3. Why We Collect This Information</h2>
                    <p style={{ marginBottom: '15px' }}>Your information is used strictly for the following purposes:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>Verifying user identity</li>
                        <li>Preventing fake, duplicate, or fraudulent accounts</li>
                        <li>Maintaining a safe and trustworthy platform environment</li>
                        <li>Enforcing our terms, policies, and community standards</li>
                        <li>Meeting legal or regulatory obligations</li>
                    </ul>
                    <p style={{ marginTop: '15px', fontWeight: '500' }}>
                        We do <strong>not</strong> use your personal or facial data for advertising, behavioral profiling, or commercial data resale.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>4. Face Verification & Biometric Data Use</h2>
                    <p style={{ marginBottom: '15px' }}>We understand that facial data is sensitive and treat it with a high level of care.</p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>Facial images are used <strong>solely for identity verification</strong></li>
                        <li>Data is encrypted during transmission and storage</li>
                        <li>Access is strictly limited to authorized systems and personnel</li>
                        <li>Facial data is never used for marketing, promotions, or analytics</li>
                        <li>Data is retained only for as long as necessary to complete verification or comply with legal requirements</li>
                    </ul>
                    <p style={{ marginTop: '15px' }}>
                        Where verification is completed and retention is no longer required, such data is securely deleted or anonymized.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>5. Data Sharing and Disclosure</h2>
                    <p style={{ marginBottom: '15px' }}>We do <strong>not sell, rent, or trade</strong> your personal information.</p>
                    <p style={{ marginBottom: '10px' }}>Your data may be shared only in limited circumstances:</p>
                    <ul style={{ paddingLeft: '20px' }}>
                        <li>With trusted service providers who assist us in verification or infrastructure support, under strict confidentiality obligations</li>
                        <li>When required by applicable law, court orders, or government authorities</li>
                        <li>To protect the rights, safety, and integrity of Trills, our users, or the public</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>6. Data Security</h2>
                    <p>We employ reasonable and appropriate safeguards to protect your information, including:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>Secure servers and encrypted storage</li>
                        <li>Controlled access mechanisms</li>
                        <li>Regular monitoring for unauthorized activity</li>
                    </ul>
                    <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        While we strive to protect your data, no digital system can be guaranteed to be completely secure.
                    </p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>7. Data Retention</h2>
                    <p>We retain personal and verification data only for as long as it is needed for:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>The purposes outlined in this Policy</li>
                        <li>Legal, regulatory, or compliance requirements</li>
                    </ul>
                    <p style={{ marginTop: '15px' }}>Once retention is no longer necessary, data is securely deleted or anonymized.</p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>8. Your Rights and Choices</h2>
                    <p>You have the right to:</p>
                    <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                        <li>Access the personal information we hold about you</li>
                        <li>Request correction of inaccurate or outdated data</li>
                        <li>Request deletion of your account and associated data, subject to legal obligations</li>
                    </ul>
                    <p style={{ marginTop: '15px' }}>Requests can be made by contacting us using the details below.</p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>9. Children’s Privacy</h2>
                    <p>The Platform is intended for users <strong>18 years of age and above</strong>. We do not knowingly collect personal data from minors.</p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>10. Changes to This Policy</h2>
                    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Updated versions will be made available on the Platform, and continued use constitutes acceptance of the revised Policy.</p>
                </section>

                <section style={{ marginBottom: '40px' }}>
                    <h2 className="title-font" style={{ fontSize: '1.75rem', marginBottom: '20px', color: 'var(--accent-primary)' }}>11. Contact & Grievance Redressal</h2>
                    <p style={{ marginBottom: '15px' }}>In accordance with applicable Indian laws, including the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, Trills has appointed a Grievance Officer to address user concerns related to privacy and data protection.</p>

                    <p><strong>Grievance Officer:</strong> [Name / Designation]</p>

                    <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                        <p>For any questions, concerns, complaints, or requests regarding this Privacy Policy or the handling of your personal data, you may contact:</p>
                        <p style={{ marginTop: '10px' }}>
                            <strong>Email:</strong> <a href="mailto:connect@trills.in" style={{ color: 'var(--accent-primary)' }}>connect@trills.in</a><br />
                            <strong>Company:</strong> Trills Media and Entertainment Pvt. Ltd.<br />
                            <strong>Address:</strong> NO: 5, Srinivas Nilaya, Paramahamsa Road, Mysuru – 570020
                        </p>
                    </div>

                    <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>We aim to acknowledge and resolve grievances within a reasonable time as prescribed under applicable law.</p>
                </section>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '40px 0', opacity: 0.3 }} />

                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Consent</p>
                    <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>
                        By using the Trills Platform, you confirm that you understand and consent to the collection and use of your information as described in this Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    );
}
