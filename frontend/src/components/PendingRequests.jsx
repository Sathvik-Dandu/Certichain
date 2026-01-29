import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function PendingRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const res = await api.get("/certificates/requests/pending");
            setRequests(res.data);
        } catch (err) {
            console.error("Failed to load requests", err);
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            await api.post(`/certificates/requests/${id}/reject`, { reason });
            setRequests(requests.filter(r => r._id !== id));
        } catch (err) {
            alert("Failed to reject request");
        }
    };

    const handleApprove = (req) => {
        navigate("/institution/issue", {
            state: {
                prefill: {
                    studentName: req.studentName,
                    rollNumber: req.rollNumber,
                    courseName: req.course,
                    branch: req.branch,
                    passOutYear: req.year,
                    email: req.email,
                    requestId: req._id
                }
            }
        });
    };

    if (loading) return <p>Loading requests...</p>;

    if (requests.length === 0) return <p>No pending requests.</p>;

    return (
        <div style={{ marginTop: "20px" }}>
            <h3>Pending Student Requests</h3>
            <table className="table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                    <tr style={{ textAlign: "left", background: "#f8f9fa" }}>
                        <th style={{ padding: "10px" }}>Student</th>
                        <th style={{ padding: "10px" }}>Roll No</th>
                        <th style={{ padding: "10px" }}>Course/Year</th>
                        <th style={{ padding: "10px" }}>Email</th>
                        <th style={{ padding: "10px" }}>Message</th>
                        <th style={{ padding: "10px" }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map(req => (
                        <tr key={req._id} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: "10px" }}>{req.studentName}</td>
                            <td style={{ padding: "10px" }}>{req.rollNumber}</td>
                            <td style={{ padding: "10px" }}>{req.course} ({req.branch}) - {req.year}</td>
                            <td style={{ padding: "10px" }}>{req.email}</td>
                            <td style={{ padding: "10px" }}>{req.message || "-"}</td>
                            <td style={{ padding: "10px" }}>
                                <button
                                    onClick={() => handleApprove(req)}
                                    className="btn btn-primary btn-sm"
                                    style={{ marginRight: "10px" }}
                                >
                                    Approve & Issue
                                </button>
                                <button
                                    onClick={() => handleReject(req._id)}
                                    className="btn btn-outline btn-sm text-danger border-danger"
                                >
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
