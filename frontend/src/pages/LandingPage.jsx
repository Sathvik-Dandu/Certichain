import { Link, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaBrain, FaQrcode, FaUniversity, FaUserTie, FaCheckCircle, FaLock, FaBuilding } from "react-icons/fa";
import "../styles/LandingPage.css";
import CinematicHero from "../components/CinematicHero";

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-container">


            <CinematicHero />


            <section className="section">
                <h2 className="section-title" style={{ width: "100%", display: "block", textAlign: "center", margin: "0 auto 1rem auto" }}>How CertiChain Works</h2>
                <p className="section-subtitle">
                    A seamless process from issuance to verification, ensuring trust at every step.
                </p>

                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-number">1</div>
                        <h3 className="step-title">Issue Certificate</h3>
                        <p className="text-secondary">
                            Institutions upload student data and generate digitally signed certificates.
                            A cryptographic hash is stored on the blockchain.
                        </p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">2</div>
                        <h3 className="step-title">Secure & Store</h3>
                        <p className="text-secondary">
                            Certificates are securely stored and anchored to the blockchain, creating
                            an immutable record that cannot be forged or altered.
                        </p>
                    </div>
                    <div className="step-card">
                        <div className="step-number">3</div>
                        <h3 className="step-title">Instant Verification</h3>
                        <p className="text-secondary">
                            Verifiers can scan a QR code or upload the document. Our Cryptographic & Blockchain engine
                            instantly confirms authenticity.
                        </p>
                    </div>
                </div>
            </section>


            <section className="section features-section">
                <div className="container">
                    <h2 className="section-title" style={{ width: "100%", display: "block", textAlign: "center", margin: "0 auto 1rem auto" }}>Why Choose CertiChain?</h2>
                    <p className="section-subtitle">
                        Traditional paper certificates are prone to forgery and hard to verify. We solve that.
                    </p>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaLock />
                            </div>
                            <div className="feature-content">
                                <h4>Blockchain Immutability</h4>
                                <p className="text-sm text-secondary">
                                    Every certificate hash is recorded on a decentralized ledger, making tampering impossible.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaLock />
                            </div>
                            <div className="feature-content">
                                <h4>Tamper-Proof Verification</h4>
                                <p className="text-sm text-secondary">
                                    SHA-256 hashing algorithms verify document integrity by comparing unique digital signatures.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaQrcode />
                            </div>
                            <div className="feature-content">
                                <h4>Instant QR Verification</h4>
                                <p className="text-sm text-secondary">
                                    No more email back-and-forth. Scan the specialized QR code for real-time validation.
                                </p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <FaShieldAlt />
                            </div>
                            <div className="feature-content">
                                <h4>Institution Identity</h4>
                                <p className="text-sm text-secondary">
                                    Only verified institutions can issue. We strictly vet all issuers on the platform.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <section className="section">
                <h2 className="section-title" style={{ width: "100%", display: "block", textAlign: "center", margin: "0 auto 1rem auto" }}>Built For Everyone</h2>
                <div className="audience-grid">
                    <div className="audience-card">
                        <FaUniversity className="audience-icon" />
                        <h3>Universities</h3>
                        <p className="text-secondary mt-2">
                            Automate issuance, reduce administrative overhead, and protect your brand reputation.
                        </p>
                    </div>
                    <div className="audience-card">
                        <FaBuilding className="audience-icon" />
                        <h3>Recruiters</h3>
                        <p className="text-secondary mt-2">
                            Screen candidates faster with instant, trustless verification of academic records.
                        </p>
                    </div>
                    <div className="audience-card">
                        <FaUserTie className="audience-icon" />
                        <h3>Students</h3>
                        <p className="text-secondary mt-2">
                            Own your credentials forever. Share verifiable proofs anywhere, anytime.
                        </p>
                    </div>
                </div>
            </section>


            <div className="trust-section">
                <h2>Uncompromised Security</h2>
                <p>
                    We combine the immutable trust of blockchain technology with the industry-standard security of SHA-256 hashing to create the world's most secure credentialing system.
                </p>
                <div className="trust-badges">
                    <div className="trust-badge">
                        <FaCheckCircle className="text-success" /> End-to-End Encryption
                    </div>
                    <div className="trust-badge">
                        <FaCheckCircle className="text-success" /> 99.9% Uptime
                    </div>
                </div>
            </div>



        </div>
    );
}
