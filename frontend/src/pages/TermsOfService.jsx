import React from 'react';

export default function TermsOfService() {
    return (
        <div className="container" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Terms of Service</h1>

                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="mt-6">1. Agreement to Terms</h3>
                    <p>
                        By accessing or using verify (the "Site"), you agree to be bound by these Terms.
                        If you disagree with any part of the terms then you may not access the Site.
                    </p>

                    <h3 className="mt-6">2. Intellectual Property</h3>
                    <p>
                        The Site and its original content, features and functionality are and will remain the exclusive property of CertiChain and its licensors.
                    </p>

                    <h3 className="mt-6">3. User Accounts</h3>
                    <p>
                        When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
                        Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                    </p>

                    <h3 className="mt-6">4. Blockchain Data</h3>
                    <p>
                        You acknowledge that data anchored to the blockchain is immutable and cannot be deleted or altered once confirmed.
                        You agree to be responsible for verifying the accuracy of any data before issuance.
                    </p>

                    <h3 className="mt-6">5. Termination</h3>
                    <p>
                        We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever,
                        including without limitation if you breach the Terms.
                    </p>

                    <h3 className="mt-6">6. Changes</h3>
                    <p>
                        We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                    </p>
                </div>
            </div>
        </div>
    );
}
