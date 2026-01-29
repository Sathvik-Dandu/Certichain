import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="container" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Privacy Policy</h1>

                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="mt-6">1. Introduction</h3>
                    <p>
                        CertiChain ("we," "our," or "us") respects your privacy and is committed to protecting your personal data.
                        This privacy policy will inform you as to how we look after your personal data when you visit our website
                        and tell you about your privacy rights and how the law protects you.
                    </p>

                    <h3 className="mt-6">2. Data We Collect</h3>
                    <p>
                        We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                        <li><strong>Contact Data:</strong> includes email address and telephone number.</li>
                        <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version.</li>
                    </ul>

                    <h3 className="mt-6">3. How We Use Your Data</h3>
                    <p>
                        We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                    </p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                        <li>To provide the verification services you request.</li>
                        <li>To register you as a new institution or user.</li>
                        <li>To manage our relationship with you.</li>
                    </ul>

                    <h3 className="mt-6">4. Data Security</h3>
                    <p>
                        We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.
                    </p>

                    <h3 className="mt-6">5. Contact Us</h3>
                    <p>
                        If you have any questions about this privacy policy, please contact us at support@certichain.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
