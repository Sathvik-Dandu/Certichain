import React from 'react';
import { FaShieldAlt, FaLock, FaServer, FaCheckCircle } from 'react-icons/fa';

export default function Security() {
    return (
        <div className="container" style={{ marginTop: '4rem', marginBottom: '4rem' }}>
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 className="section-title" style={{ textAlign: 'center', marginBottom: '2rem' }}>Security Overview</h1>

                <div style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                    <p className="text-center" style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
                        Security is at the core of CertiChain. We use state-of-the-art cryptography and blockchain technology to ensure verification you can trust.
                    </p>

                    <div className="grid grid-cols-1 gap-4" style={{ marginTop: '2rem' }}>
                        <div className="feature-item" style={{ alignItems: 'flex-start', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <FaLock style={{ color: 'var(--primary)', fontSize: '1.5rem', marginTop: '5px' }} />
                            <div>
                                <h4>Blockchain Immutability</h4>
                                <p>
                                    Every certificate issued on our platform is anchored to a decentralized blockchain ledger.
                                    This creates a permanent, tamper-proof record that cannot be altered or deleted by anyone, including us.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item" style={{ alignItems: 'flex-start', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <FaShieldAlt style={{ color: 'var(--primary)', fontSize: '1.5rem', marginTop: '5px' }} />
                            <div>
                                <h4>Cryptographic Signatures</h4>
                                <p>
                                    Institutions sign certificates using their private cryptographic keys.
                                    This mathematically proves the origin of the document and ensures it was issued by an authorized entity.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item" style={{ alignItems: 'flex-start', display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                            <FaServer style={{ color: 'var(--primary)', fontSize: '1.5rem', marginTop: '5px' }} />
                            <div>
                                <h4>Data Encryption</h4>
                                <p>
                                    All data transmitted between your browser and our servers is encrypted using TLS 1.2+.
                                    Sensitive personal data is encrypted at rest using industry-standard AES-256 encryption.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface-alt)', padding: '2rem', borderRadius: 'var(--radius)', marginTop: '2rem' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Our Security Commitments</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <FaCheckCircle className="text-success" /> Regular security audits and penetration testing.
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <FaCheckCircle className="text-success" /> Compliance with GDPR and data protection regulations.
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <FaCheckCircle className="text-success" /> strict access controls and authentication protocols.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
