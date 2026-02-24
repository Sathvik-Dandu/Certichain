import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [pendingCertificates, setPendingCertificates] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingCertId, setLoadingCertId] = useState(null);
  const [rsaVerifiedStatus, setRsaVerifiedStatus] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, pendingRes, allRes, pendingCertsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/institutions?status=pending"),
          api.get("/admin/dashboard/institutions"),
          api.get("/admin/certificates/pending"),
        ]);
        setStats(statsRes.data);
        setPendingInstitutions(pendingRes.data);
        setAllInstitutions(allRes.data);
        setPendingCertificates(pendingCertsRes.data);
      } catch (error) {
        console.error("Error loading admin data", error);
      }
    };
    loadData();
  }, []);

  const handleApprove = async (id) => {
    await api.put(`/admin/institutions/${id}/approve`);
    setPendingInstitutions((prev) => prev.filter((i) => i._id !== id));

    // Refresh all institutions list
    const res = await api.get("/admin/dashboard/institutions");
    setAllInstitutions(res.data);
  };

  const handleApproveCertificate = async (id) => {
    if (!window.confirm("Approve and Digitally Sign this certificate?")) return;
    try {
      setLoadingCertId(id);
      await api.post(`/admin/certificates/verify/${id}`);
      setPendingCertificates((prev) => prev.filter((c) => c._id !== id));
      alert("Certificate Verified & Signed Successfully!");
    } catch (error) {
      console.error("Verification failed", error);
      alert("Failed to verify certificate: " + (error.response?.data?.message || error.message));
    } finally {
      setLoadingCertId(null);
    }
  };

  const handleVerifyRSA = async (id) => {
    try {
      setLoadingCertId(`rsa-${id}`);
      await api.post(`/admin/certificates/verify-rsa/${id}`);

      setRsaVerifiedStatus(prev => ({ ...prev, [id]: true }));
      alert("RSA Signature Verified Successfully!");
    } catch (error) {
      console.error("RSA Verification failed", error);
      alert("Failed to verify RSA signature: " + (error.response?.data?.message || error.message));
    } finally {
      setLoadingCertId(null);
    }
  };

  const handleReject = async (id) => {
    await api.put(`/admin/institutions/${id}/reject`);
    setPendingInstitutions((prev) => prev.filter((i) => i._id !== id));

    // Refresh all institutions list
    const res = await api.get("/admin/dashboard/institutions");
    setAllInstitutions(res.data);
  };

  const filteredInstitutions = allInstitutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.shortCode.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (inst) => {
    if (inst.isApproved) return <span className="status-badge approved">Approved</span>;
    if (inst.isRejected) return <span className="status-badge rejected">Rejected</span>;
    return <span className="status-badge pending">Pending</span>;
  };

  if (!stats) return <div className="admin-dashboard-container"><p>Loading admin dashboard...</p></div>;

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2 className="admin-title">Admin Dashboard</h2>
      </div>


      <div className="admin-stats-grid">
        <SummaryCard label="Total Institutions" value={stats.totalInstitutions} />
        <SummaryCard label="Approved" value={stats.approvedInstitutions} />
        <SummaryCard label="Rejected" value={stats.rejectedInstitutions} />
        <SummaryCard label="Pending" value={stats.pendingInstitutions} />
        <SummaryCard label="Certificates Issued" value={stats.totalCertificates} />
      </div>

      <div className="admin-section">
        <h3 className="section-title">Pending Institution Approvals</h3>
        {pendingInstitutions.length === 0 ? (
          <p className="text-secondary">No pending requests at the moment.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Short Code</th>
                  <th>Documents</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingInstitutions.map((inst) => (
                  <tr key={inst._id}>
                    <td>{inst.name}</td>
                    <td>{inst.email}</td>
                    <td>{inst.shortCode}</td>
                    <td>
                      {inst.documents && inst.documents.length > 0 ? (
                        inst.documents.map((doc, idx) => {
                          const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
                          return (
                            <div key={idx}>
                              <a
                                href={`${baseUrl}${doc}`}
                                target="_blank"
                                rel="noreferrer"
                                className="doc-link"
                              >
                                Document {idx + 1}
                              </a>
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-muted">No docs</span>
                      )}
                    </td>
                    <td>
                      <button className="action-btn approve" onClick={() => handleApprove(inst._id)}>Approve</button>
                      <button className="action-btn reject" onClick={() => handleReject(inst._id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3 className="section-title">Pending Certificate Approvals</h3>
        {pendingCertificates.length === 0 ? (
          <p className="text-secondary">No pending certificates.</p>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Institution</th>
                  <th>Date</th>
                  <th>File</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCertificates.map((cert) => (
                  <tr key={cert._id}>
                    <td>{cert.studentName}</td>
                    <td>{cert.courseName}</td>
                    <td>{cert.institution?.name || "Unknown"}</td>
                    <td>{new Date(cert.createdAt).toLocaleDateString()}</td>
                    <td>
                      {cert.ipfsHash ? (
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${cert.ipfsHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="doc-link"
                        >
                          View PDF
                        </a>
                      ) : "N/A"}
                    </td>
                    <td>
                      <button
                        className="action-btn rsa-verify"
                        onClick={() => handleVerifyRSA(cert._id)}
                        disabled={loadingCertId === `rsa-${cert._id}` || rsaVerifiedStatus[cert._id]}
                        style={{ marginRight: '8px', backgroundColor: rsaVerifiedStatus[cert._id] ? '#4CAF50' : '#2196F3', color: 'white' }}
                      >
                        {loadingCertId === `rsa-${cert._id}` ? "Verifying..." : rsaVerifiedStatus[cert._id] ? "RSA Verified" : "Verify RSA"}
                      </button>
                      <button
                        className="action-btn approve"
                        onClick={() => handleApproveCertificate(cert._id)}
                        disabled={loadingCertId === cert._id || !rsaVerifiedStatus[cert._id]}
                      >
                        {loadingCertId === cert._id ? "Signing..." : "Approve & Sign"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-section">
        <h3 className="section-title">Institution Registry</h3>

        <input
          type="text"
          placeholder="Search institutions by name or code..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Institution Name</th>
                <th>Short Code</th>
                <th>Status</th>
                <th>Certificates Issued</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstitutions.map((inst) => (
                <tr key={inst._id}>
                  <td><strong>{inst.name}</strong></td>
                  <td>{inst.shortCode}</td>
                  <td>{getStatusBadge(inst)}</td>
                  <td>{inst.certificatesCount}</td>
                </tr>
              ))}
              {filteredInstitutions.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "2rem" }}>
                    No institutions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="stats-card">
      <div className="stats-label">{label}</div>
      <div className="stats-value">{value}</div>
    </div>
  );
}
