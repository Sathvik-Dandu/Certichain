import { useEffect, useState } from "react";
import api from "../services/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingInstitutions, setPendingInstitutions] = useState([]);
  const [allInstitutions, setAllInstitutions] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, pendingRes, allRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/institutions?status=pending"),
          api.get("/admin/dashboard/institutions"),
        ]);
        setStats(statsRes.data);
        setPendingInstitutions(pendingRes.data);
        setAllInstitutions(allRes.data);
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

      <div className="stats-grid">
        <SummaryCard label="Total Institutions" value={stats.totalInstitutions} />
        <SummaryCard label="Approved" value={stats.approvedInstitutions} />
        <SummaryCard label="Rejected" value={stats.rejectedInstitutions} />
        <SummaryCard label="Pending" value={stats.pendingInstitutions} />
        <SummaryCard label="Certificates Issued" value={stats.totalCertificates} />
      </div>

      <div className="admin-section">
        <h3 className="section-title">Pending Approvals</h3>
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
                        inst.documents.map((doc, idx) => (
                          <div key={idx}>
                            <a
                              href={`http://localhost:5000${doc}`}
                              target="_blank"
                              rel="noreferrer"
                              className="doc-link"
                            >
                              Document {idx + 1}
                            </a>
                          </div>
                        ))
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
