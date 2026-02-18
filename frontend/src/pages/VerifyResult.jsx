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
        <div className="container" style={{ margin: "4rem auto", padding: "0 1rem" }}>
            <div className="card" style={{ maxWidth: "850px", margin: "0 auto", padding: "3rem" }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h1 style={{ color: "var(--success)", marginBottom: "0.5rem", fontSize: "2.5rem" }}>Certificate Verified </h1>
                    <p className="text-secondary" style={{ fontSize: "1.1rem" }}>This certificate is valid and secured on the blockchain.</p>

                    {/* Integrity Badge */}
                    <div style={{ marginTop: "1rem" }}>

                        {data.signatureVerified && (
                            <span className="badge" style={{ backgroundColor: "rgba(59, 130, 246, 0.1)", color: "var(--primary)", border: "1px solid var(--primary)", padding: "0.5rem 1rem" }}>
                                Digital Signature Verified
                            </span>
                        )}
                    </div>
                </div>



                <div className="grid" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "2rem",
                    marginBottom: "2rem"
                }}>
                    <div className="info-group">
                        <label className="text-sm text-secondary uppercase font-bold mb-1 block">Student Name</label>
                        <div className="text-xl font-semibold text-gray-800">{data.studentName}</div>
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

                <hr style={{ margin: "2rem 0", borderColor: "var(--border)" }} />

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
