
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
                <div className="certificate-status">Valid Certificate</div>
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
        </div>
    );
}
