import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";

export default function VerifyResult() {
    const { certificateId } = useParams();
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("LOADING");
    const [message, setMessage] = useState("");


    useEffect(() => {
        setStatus("LOADING");
        console.log("Fetching certificate:", certificateId);
        api
            .get(`/public/certificate/${certificateId}`)
            .then((res) => {
                console.log("API Response:", res.data);
                if (res.data.status === "REMOVED") {
                    setStatus("REMOVED");
                    setMessage(res.data.message);
                } else if (res.data.verified) {
                    console.log("Setting Data:", res.data.certificate);
                    setData(res.data.certificate);
                    setStatus("VERIFIED");




                } else {
                    setStatus("NOT_FOUND");
                }
            })
            .catch((err) => {
                console.error("Verification API Error:", err);
                setStatus("ERROR");
                setMessage("Certificate not found or invalid");
            });
    }, [certificateId]);

    if (status === "LOADING") {
        return (
            <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
                <div className="spinner"></div>
                <p>Verifying Certificate...</p>
            </div>
        );
    }

    if (status === "REMOVED") {
        return (
            <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
                <div className="card" style={{ maxWidth: "500px", margin: "0 auto", borderColor: "var(--danger)" }}>
                    <h2 className="text-danger">Certificate Revoked </h2>
                    <p>{message}</p>
                    <a href="/" className="btn btn-primary mt-4">Go Back</a>
                </div>
            </div>
        );
    }

    if (status === "ERROR" || status === "NOT_FOUND") {
        return (
            <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
                <div className="card" style={{ maxWidth: "500px", margin: "0 auto", borderColor: "var(--danger)" }}>
                    <h2 className="text-danger">Verification Failed </h2>
                    <p>{message || "Certificate not found"}</p>
                    <a href="/" className="btn btn-primary mt-4">Go Back</a>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>
                <div className="card" style={{ maxWidth: "500px", margin: "0 auto", borderColor: "var(--warning)" }}>
                    <h2 className="text-warning">Data Error</h2>
                    <p>Certificate verified, but details could not be loaded.</p>
                    <a href="/" className="btn btn-primary mt-4">Go Back</a>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ margin: "1rem auto", padding: "0 1rem" }}>
            <div className="card" style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.8rem 2.5rem" }}>
                <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    {data.signatureStatus === "PENDING_ADMIN_VERIFICATION" ? (
                        <>
                            <h1 style={{ color: "#d97706", marginBottom: "0.25rem", fontSize: "1.6rem" }}>Signature Pending ⚠️</h1>
                            <p className="text-secondary" style={{ fontSize: "0.95rem", margin: 0 }}>This certificate is issued but waiting for Admin Verification.</p>
                        </>
                    ) : (
                        <>
                            <h1 style={{ color: "var(--success)", marginBottom: "0.25rem", fontSize: "1.6rem" }}>Certificate Verified ✅</h1>
                            <p className="text-secondary" style={{ fontSize: "0.95rem", margin: 0 }}>This certificate is valid and secured on the blockchain.</p>
                        </>
                    )}
                </div>

                {/* Validation Cards */}
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
                    {/* LEFT CARD — Not Verified (yellow) */}
                    {data.signatureStatus === "PENDING_ADMIN_VERIFICATION" && (
                        <div style={{
                            flex: "1", maxWidth: "380px", padding: "0.8rem 1rem", borderRadius: "10px",
                            border: "2px solid #d97706", backgroundColor: "#fef9e7"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: "1.2rem" }}>⚠️</span>
                                <span style={{ fontWeight: "700", color: "#d97706", fontSize: "0.95rem" }}>Signature Not Verified</span>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#555", lineHeight: "1.6" }}>
                                <div>Digitally signed by {data.institutionName || "Registrar"}</div>
                                <div>Date: {new Date(data.issueDate || data.createdAt).toLocaleString("en-IN")}</div>
                                <div>Reason: Pending CertiChain Admin Verification</div>
                                <div>Location: India</div>
                            </div>
                        </div>
                    )}

                    {/* RIGHT CARD — Verified (green) */}
                    {data.signatureStatus === "VERIFIED" && (
                        <div style={{
                            flex: "1", maxWidth: "380px", padding: "0.8rem 1rem", borderRadius: "10px",
                            border: "2px solid #16a34a", backgroundColor: "#f0fdf4"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: "1.2rem" }}>✅</span>
                                <span style={{ fontWeight: "700", color: "#16a34a", fontSize: "0.95rem" }}>Signature Valid</span>
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#555", lineHeight: "1.6" }}>
                                <div>Verified by: {data.adminVerifiedBy || "CertiChain Admin"}</div>
                                <div>Date: {data.adminVerifiedAt ? new Date(data.adminVerifiedAt).toLocaleString("en-IN") : "—"}</div>
                                <div>Reason: {data.verificationReason || "CertiChain Document Verification"}</div>
                                <div>Location: {data.verificationLocation || "India"}</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1.2rem 2.5rem",
                    marginBottom: "1.2rem"
                }}>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Student Name</label>
                        <div className="text-lg font-semibold text-gray-800">{data.studentName}</div>
                    </div>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Certificate ID</label>
                        <div className="text-lg font-mono bg-gray-50 px-2 rounded inline-block">{data.certificateId}</div>
                    </div>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Institution</label>
                        <div className="text-lg">{data.institutionName}</div>
                    </div>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Course</label>
                        <div className="text-lg">{data.courseName}</div>
                    </div>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Branch</label>
                        <div className="text-lg">{data.branch}</div>
                    </div>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Year of Passing</label>
                        <div className="text-lg">{data.passOutYear}</div>
                    </div>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Issued At</label>
                        <div className="text-lg">{new Date(data.issuedAt).toLocaleDateString()}</div>
                    </div>
                </div>

                <hr style={{ margin: "0.8rem 0", borderColor: "var(--border)" }} />

                <div className="actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                    {data.ipfsHash && (
                        <a
                            href={`https://gateway.pinata.cloud/ipfs/${data.ipfsHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary"
                        >
                            View Certificate
                        </a>
                    )}

                    {data.blockchainTxHash && (
                        <a
                            href={`https://sepolia.etherscan.io/tx/${data.blockchainTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-secondary"
                        >
                            View on Blockchain
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
