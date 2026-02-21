
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import "./CertificateView.css";

export default function CertificateView() {
    const { certificateId } = useParams();
    const [cert, setCert] = useState(null);
    const [message, setMessage] = useState("Loading...");

    useEffect(() => {
        const fetchCert = async () => {
            try {
                const res = await api.get(`/certificates/${certificateId}`);
                setCert(res.data);
                setMessage("");
            } catch (err) {
                console.error(err);
                const errorMsg =
                    err.response?.data?.message || "Certificate not found or server error.";
                setMessage(errorMsg);
            }
        };
        fetchCert();
    }, [certificateId]);

    if (message && !cert) {
        return (
            <div className="certificate-container">
                <div className={message === "Loading..." ? "cert-loading" : "cert-error"}>
                    {message}
                </div>
            </div>
        );
    }

    if (!cert) return null;

    return (
        <div className="certificate-container">
            <div className="certificate-header">
                <h2 className="certificate-title">Certificate Verification</h2>
                {cert.signatureStatus === "PENDING_ADMIN_VERIFICATION" ? (
                    <div className="certificate-status" style={{ backgroundColor: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <span>⚠️</span> Pending Admin Verification
                    </div>
                ) : (
                    <div className="certificate-status">Valid Certificate</div>
                )}
            </div>

            <div className="certificate-body">
                <div className="detail-item">
                    <span className="detail-label">Certificate ID</span>
                    <span className="detail-value">{cert.certificateId}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Student Name</span>
                    <span className="detail-value">{cert.studentName}</span>
                </div>
                <div className="detail-item">
                    <span className="detail-label">Course</span>
                    <span className="detail-value">{cert.courseName}</span>
                </div>

                {cert.branch && (
                    <div className="detail-item">
                        <span className="detail-label">Branch</span>
                        <span className="detail-value">{cert.branch}</span>
                    </div>
                )}

                {cert.passOutYear && (
                    <div className="detail-item">
                        <span className="detail-label">Pass-out Year</span>
                        <span className="detail-value">{cert.passOutYear}</span>
                    </div>
                )}

                <div className="detail-item">
                    <span className="detail-label">Institution</span>
                    <span className="detail-value">{cert.institutionName}</span>
                </div>
            </div>

            {cert.blockchainTxHash && (
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                    <a
                        href={`https://sepolia.etherscan.io/tx/${cert.blockchainTxHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ display: "inline-block", textDecoration: "none", padding: "10px 20px", background: "#f3f4f6", color: "#333", border: "1px solid #ddd", borderRadius: "6px" }}
                    >
                        View on Blockchain 🔗
                    </a>
                </div>
            )}

            {cert.institution && (
                <div className="certificate-footer">
                    <div className="institution-info">
                        <h4>Issued by</h4>
                        <div className="institution-details">
                            <span>{cert.institution.name}</span>
                            <span>•</span>
                            <span>{cert.institution.email}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* DEMO PURPOSES ONLY */}
            <div style={{ marginTop: "30px", textAlign: "center", borderTop: "1px dashed #ccc", paddingTop: "20px" }}>
                <h4 style={{ color: "#666", marginBottom: "10px" }}>Security Demonstration</h4>
                <button
                    onClick={async () => {
                        if (window.confirm("WARNING: This will corrupt the certificate data in the database to demonstrate how the digital signature verification fails. Proceed?")) {
                            try {
                                await api.post(`/certificates/tamper/${cert.certificateId}`);
                                alert("Data corrupted! Reloading to check verification status...");
                                window.location.reload();
                            } catch (e) {
                                alert("Tamper failed: " + (e.response?.data?.message || e.message));
                            }
                        }
                    }}
                    className="btn"
                    style={{ backgroundColor: "#ef4444", color: "white", padding: "8px 16px", borderRadius: "4px", border: "none" }}
                >
                    ⚠️ Simulate Cyber Attack (Tamper Data)
                </button>
                <p style={{ fontSize: "0.8rem", color: "#888", marginTop: "5px" }}>
                    Clicking this will modify the student's name in the DB without re-signing.
                </p>
            </div>
        </div>
    );
}
