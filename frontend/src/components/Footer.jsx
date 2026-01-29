import React from 'react';
import { Link } from "react-router-dom";
import "../styles/Footer.css";

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <h3 style={{ fontSize: '2rem' }}>certichain.</h3>
                    <p>
                        The global standard for digital credential issuance and verification.
                    </p>
                </div>

                <div className="footer-links">
                    <div className="link-group">
                        <h4>Platform</h4>
                        <Link to="/verify">Verify</Link>
                        <Link to="/institution/login">Institution Login</Link>
                        <Link to="/admin/login">Admin Access</Link>
                    </div>

                    <div className="link-group">
                        <h4>Legal</h4>
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                        <Link to="/security">Security</Link>
                    </div>

                    <div className="link-group">
                        <h4>Connect</h4>
                        <a href="#">Twitter</a>
                        <a href="#">LinkedIn</a>
                        <a href="mailto:support@certichain.com">Contact Us</a>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                &copy; {new Date().getFullYear()} CertiChain Foundation. All rights reserved.
            </div>
        </footer>
    );
}
