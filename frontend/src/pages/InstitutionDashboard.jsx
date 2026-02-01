import { useEffect, useState } from "react";
import api from "../services/api";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import "./InstitutionDashboard.css";
import PendingRequests from "../components/PendingRequests";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

function InstitutionDashboard() {
    const [activeTab, setActiveTab] = useState("certificates");
    const [stats, setStats] = useState(null);
    const [certificates, setCertificates] = useState([]);
    const [loadingError, setLoadingError] = useState(null);

    const fetchCertificates = async () => {
        try {
            const res = await api.get("/institutions/certificates");
            setCertificates(res.data);
        } catch (err) {
            console.error("Failed to fetch certificates", err);
        }
    };

    useEffect(() => {
        api.get("/institutions/dashboard/stats")
            .then((res) => {
                setStats(res.data);
            })
            .catch((err) => {
                console.error("Dashboard stats error:", err);
                setLoadingError("Failed to load dashboard statistics.");
            });
        fetchCertificates();
    }, []);

    const handleDelete = async (certificateId) => {
        if (!window.confirm("Are you sure you want to remove this certificate? This action cannot be undone.")) return;

        try {
            await api.delete(`/institutions/certificates/${certificateId}`);
            alert("Certificate removed successfully");
            fetchCertificates();
        } catch (err) {
            console.error(err);
            alert("Failed to remove certificate");
        }
    };

    if (loadingError) return <div className="inst-dashboard-container"><p className="text-danger">{loadingError}</p></div>;
    if (!stats) return <div className="inst-dashboard-container"><p>Loading dashboard...</p></div>;

    const yearChartData = {
        labels: stats.certificatesPerYear?.map((y) => y._id) || [],
        datasets: [
            {
                label: "Certificates Issued",
                data: stats.certificatesPerYear?.map((y) => y.count) || [],
                backgroundColor: "rgba(54, 162, 235, 0.8)",
                borderRadius: 4,
            },
        ],
    };

    const branchChartData = {
        labels: stats.certificatesPerBranch?.map((b) => b._id.toUpperCase()) || [],
        datasets: [
            {
                label: "Certificates",
                data: stats.certificatesPerBranch?.map((b) => b.count) || [],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className="inst-dashboard-container">
            <div className="inst-header">
                <h2 className="inst-title">Institution Dashboard</h2>
            </div>

            <div className="inst-tabs">
                <button
                    className={`inst-tab ${activeTab === "certificates" ? "active" : ""}`}
                    onClick={() => setActiveTab("certificates")}
                >
                    Issued Certificates
                </button>
                <button
                    className={`inst-tab ${activeTab === "requests" ? "active" : ""}`}
                    onClick={() => setActiveTab("requests")}
                >
                    Pending Requests
                    {stats?.pendingRequests > 0 && (
                        <span className="inst-badge">{stats.pendingRequests}</span>
                    )}
                </button>
            </div>

            {activeTab === "requests" ? (
                <PendingRequests />
            ) : (
                <>
                    <div className="inst-stats-card">
                        <div className="inst-stats-value">{stats.totalCertificates}</div>
                        <div className="inst-stats-label">Total Certificates Issued</div>
                    </div>

                    <div className="inst-stats-card" onClick={() => setActiveTab("requests")} style={{ cursor: "pointer" }}>
                        <div className="inst-stats-value">{stats.pendingRequests || 0}</div>
                        <div className="inst-stats-label">Pending Requests</div>
                    </div>

                    <div className="inst-charts-grid">
                        <div className="inst-chart-card">
                            <h3 className="inst-chart-title">Certificates per Year</h3>
                            <Bar data={yearChartData} options={{ maintainAspectRatio: true }} />
                        </div>

                        <div className="inst-chart-card">
                            <h3 className="inst-chart-title">Certificates per Branch</h3>
                            <Pie data={branchChartData} />
                        </div>
                    </div>

                    <div className="inst-table-section">
                        <h3 className="inst-table-header">Certificate Registry</h3>
                        {certificates.length === 0 ? (
                            <p className="text-secondary">No certificates issued yet.</p>
                        ) : (
                            <div className="inst-table-wrapper">
                                <table className="inst-table">
                                    <thead>
                                        <tr>
                                            <th>Certificate ID</th>
                                            <th>Student Name</th>
                                            <th>Course</th>
                                            <th>Status</th>
                                            <th>Issued At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {certificates.map((cert) => (
                                            <tr key={cert._id}>
                                                <td>{cert.certificateId}</td>
                                                <td><strong>{cert.studentName}</strong></td>
                                                <td>{cert.courseName}</td>
                                                <td>
                                                    <span className={`inst-status-badge ${cert.status === "ACTIVE" ? "active" : "removed"}`}>
                                                        {cert.status === "ACTIVE" ? "Active" : "Removed"}
                                                    </span>
                                                </td>
                                                <td>{new Date(cert.createdAt).toLocaleDateString()}</td>
                                                <td>
                                                    {cert.status === "ACTIVE" && (
                                                        <button
                                                            className="inst-btn-remove"
                                                            onClick={() => handleDelete(cert.certificateId)}
                                                        >
                                                            Remove
                                                        </button>
                                                    )}

                                                    {cert.blockchainTxHash && (
                                                        <a
                                                            href={`https://sepolia.etherscan.io/tx/${cert.blockchainTxHash}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inst-btn-blockchain"
                                                        >
                                                            Blockchain
                                                        </a>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default InstitutionDashboard;
