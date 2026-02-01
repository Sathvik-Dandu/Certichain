import { useState, useEffect } from "react";
import api from "../services/api";
import ButtonLoader from "../components/ButtonLoader";
import StaggeredDropDown from "../components/StaggeredDropDown";

const COURSE_BRANCH_MAP = {
    "B.Tech": ["Computer Science", "Information Technology", "Electronics & Communication", "Mechanical Engineering", "Civil Engineering", "Electrical Engineering"],
    "M.Tech": ["Computer Science", "VLSI", "Thermal Engineering", "Structural Engineering", "Artificial Intelligence"],
    "B.Sc": ["Physics", "Chemistry", "Mathematics", "Computer Science", "Agriculture"],
    "M.Sc": ["Physics", "Chemistry", "Mathematics", "Biotechnology", "Microbiology"],
    "MBA": ["Finance", "Marketing", "HR", "Operations", "Business Analytics"],
    "BBA": ["General", "Finance", "Marketing", "International Business"],
    "Ph.D": ["Engineering", "Science", "Management", "Humanities"],
    "M.B.B.S": ["General Medicine", "Surgery", "Pediatrics", "Cardiology"],
    "B.Com": ["General", "Accounting", "Finance", "Taxation"],
    "M.Com": ["Accounting", "Finance", "Business Studies"],
    "B.Arch": ["Architecture", "Interior Design", "Urban Planning"],
    "M.Arch": ["Urban Design", "Landscape Architecture"],
    "B.Des": ["Fashion Design", "Industrial Design", "Communication Design"],
    "LL.B": ["General Law", "Corporate Law", "Criminal Law"],
    "LL.M": ["Constitutional Law", "Corporate Law", "Criminal Law"],
    "CA": ["Accounting", "Auditing", "Taxation"],
    "CFA": ["Finance", "Investment Analysis"]
};

const COURSE_OPTIONS = Object.keys(COURSE_BRANCH_MAP);

export default function RequestCertificate() {
    const [institutions, setInstitutions] = useState([]);
    const [form, setForm] = useState({
        institutionId: "",
        studentName: "",
        email: "",
        course: "",
        branch: "",
        year: "",
        rollNumber: "",
        message: ""
    });
    const [availableBranches, setAvailableBranches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    // Tracking State
    const [trackEmail, setTrackEmail] = useState("");
    const [trackStatus, setTrackStatus] = useState(null); // { status, studentName, rejectionReason, issuedCertificateId }
    const [trackLoading, setTrackLoading] = useState(false);
    const [trackError, setTrackError] = useState("");

    // Forwarding State
    const [forwardEmail, setForwardEmail] = useState("");
    const [forwardLoading, setForwardLoading] = useState(false);
    const [forwardSuccess, setForwardSuccess] = useState("");

    useEffect(() => {
        const fetchInsts = async () => {
            try {
                const res = await api.get("/institutions/public/list");
                setInstitutions(res.data);
            } catch (e) {
                console.error("Failed to load institutions");
            }
        };
        fetchInsts();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSelectChange = (name, value) => {
        if (name === "course") {
            const branches = COURSE_BRANCH_MAP[value] || [];
            setAvailableBranches(branches);
            setForm((prev) => ({ ...prev, course: value, branch: "" }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccess("");
        setError("");

        try {
            await api.post("/public/request-certificate", form);
            setSuccess("Your request has been submitted successfully! Check your status using the panel on the right.");
            setForm({
                institutionId: "",
                studentName: "",
                email: "",
                course: "",
                branch: "",
                year: "",
                rollNumber: "",
                message: ""
            });
            setAvailableBranches([]);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit request.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCheckStatus = async (e) => {
        e.preventDefault();
        setTrackLoading(true);
        setTrackStatus(null);
        setTrackError("");
        setForwardSuccess("");

        try {
            const res = await api.post("/public/check-status", { email: trackEmail });
            setTrackStatus(res.data);
        } catch (err) {
            setTrackError(err.response?.data?.message || "Could not fetch status.");
        } finally {
            setTrackLoading(false);
        }
    };

    const handleForward = async (e) => {
        e.preventDefault();
        if (!trackStatus?.issuedCertificateId) return;

        setForwardLoading(true);
        setForwardSuccess("");
        try {
            await api.post("/public/forward-certificate", {
                certificateId: trackStatus.issuedCertificateId,
                targetEmail: forwardEmail
            });
            setForwardSuccess(`Certificate sent to ${forwardEmail}!`);
            setForwardEmail("");
        } catch (err) {
            alert("Failed to forward certificate. Please try again.");
        } finally {
            setForwardLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 1rem" }}>
            <h2 className="text-center mb-6">Certificate & Records Portal</h2>

            <div className="split-layout">
                {/* LEFT PANEL: Request Form */}
                <div className="card request-panel">
                    <h3 className="mb-4 text-primary">Request New Certificate</h3>
                    <p className="text-secondary text-sm mb-6">
                        Submit your details to your institution for verification.
                    </p>

                    {success ? (
                        <div className="alert alert-success">
                            <h4>Request Submitted!</h4>
                            <p>{success}</p>
                            <button onClick={() => setSuccess("")} className="btn btn-outline btn-sm mt-4">Submit Another</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Select Institution</label>
                                <select
                                    name="institutionId"
                                    className="form-input"
                                    value={form.institutionId}
                                    onChange={(e) => setForm({ ...form, institutionId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Choose Institute --</option>
                                    {institutions.map(inst => (
                                        <option key={inst._id} value={inst._id}>{inst.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Full Name</label>
                                    <input type="text" name="studentName" className="form-input" value={form.studentName} onChange={handleChange} required />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Roll Number</label>
                                    <input type="text" name="rollNumber" className="form-input" value={form.rollNumber} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" name="email" className="form-input" placeholder="Where you want to receive updates" value={form.email} onChange={handleChange} required />
                            </div>

                            <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Course</label>
                                    <StaggeredDropDown options={COURSE_OPTIONS} onSelect={(val) => handleSelectChange("course", val)} placeholder="Select Course" />
                                    <input value={form.course} required style={{ opacity: 0, height: 0, position: 'absolute' }} tabIndex={-1} onChange={() => { }} />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Branch</label>
                                    <StaggeredDropDown key={form.course} options={availableBranches.length > 0 ? availableBranches : ["Select a course first"]} onSelect={(val) => handleSelectChange("branch", val)} placeholder="Select Branch" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Passing Year</label>
                                <select name="year" className="form-input" value={form.year} onChange={handleChange} required>
                                    <option value="">Select Year</option>
                                    {[2023, 2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Message (Optional)</label>
                                <textarea name="message" className="form-input" value={form.message} onChange={handleChange} rows="2"></textarea>
                            </div>

                            {error && <p className="text-danger mb-4">{error}</p>}

                            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                                {isLoading ? <ButtonLoader /> : "Submit Request"}
                            </button>
                        </form>
                    )}
                </div>

                {/* MIDDLE DIVIDER */}
                <div className="divider-vertical">
                    <span>OR</span>
                </div>

                {/* RIGHT PANEL: Track Status */}
                <div className="card track-panel">
                    <h3 className="mb-4 text-secondary">Track Your Request</h3>
                    <p className="text-secondary text-sm mb-6">
                        Check the status of your application using your registered email.
                    </p>

                    <form onSubmit={handleCheckStatus} className="mb-6">
                        <div className="form-group">
                            <label className="form-label">Enter Registered Email</label>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', width: '100%' }}>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={trackEmail}
                                    onChange={(e) => setTrackEmail(e.target.value)}
                                    placeholder="student@example.com"
                                    required
                                    style={{ maxWidth: '300px' }}
                                />
                                <button type="submit" className="btn btn-secondary" disabled={trackLoading}>
                                    {trackLoading ? "..." : "Check"}
                                </button>
                            </div>
                        </div>
                    </form>

                    {trackError && <div className="alert alert-danger">{trackError}</div>}

                    {trackStatus && (
                        <div className="status-result fade-in">
                            <div style={{ padding: '1rem', background: 'var(--surface-alt)', borderRadius: '8px', borderLeft: `4px solid ${trackStatus.status === 'APPROVED' ? 'var(--success)' : trackStatus.status === 'REJECTED' ? 'var(--danger)' : 'var(--warning)'}` }}>
                                <h4 style={{ margin: 0, color: 'var(--primary)' }}>{trackStatus.studentName}</h4>
                                <p className="text-sm text-secondary mb-2">{trackStatus.course} • {trackStatus.institutionName}</p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    Status:
                                    <span style={{ color: trackStatus.status === 'APPROVED' ? 'var(--success)' : trackStatus.status === 'REJECTED' ? 'var(--danger)' : 'var(--warning)' }}>
                                        {trackStatus.status}
                                    </span>
                                </div>

                                {trackStatus.status === 'REJECTED' && (
                                    <p className="text-danger mt-2 text-sm bg-white p-2 rounded border border-danger">
                                        Reason: {trackStatus.rejectionReason || "Requirements not met."}
                                    </p>
                                )}

                                {trackStatus.status === 'APPROVED' && (
                                    <div className="mt-4">
                                        <p className="text-success text-sm mb-2">✓ Certificate Issued Successfully!</p>

                                        <div className="forward-box mt-4 pt-4 border-t border-gray-200">
                                            <label className="form-label text-sm">Forward to Employer/Another Email</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="email"
                                                    className="form-input text-sm"
                                                    placeholder="recipient@example.com"
                                                    value={forwardEmail}
                                                    onChange={(e) => setForwardEmail(e.target.value)}
                                                />
                                                <button onClick={handleForward} className="btn btn-primary btn-sm" disabled={forwardLoading}>
                                                    {forwardLoading ? "Sending..." : "Send"}
                                                </button>
                                            </div>
                                            {forwardSuccess && <p className="text-success text-xs mt-2">{forwardSuccess}</p>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx="true">{`
                .split-layout {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    gap: 2rem;
                    align-items: center; /* Changed from start to center */
                }

                .divider-vertical {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 1rem;
                }

                .divider-vertical::before,
                .divider-vertical::after {
                    content: "";
                    width: 1px;
                    height: 100%;
                    background: var(--border);
                    min-height: 100px;
                }

                .divider-vertical span {
                    background: var(--surface);
                    border: 1px solid var(--border);
                    padding: 0.5rem;
                    border-radius: 50%;
                    font-size: 0.8rem;
                    color: var(--text-secondary);
                    font-weight: bold;
                }

                @media (max-width: 900px) {
                    .split-layout {
                        grid-template-columns: 1fr;
                        gap: 3rem;
                    }
                    .divider-vertical {
                        flex-direction: row;
                        width: 100%;
                        height: auto;
                    }
                    .divider-vertical::before,
                    .divider-vertical::after {
                        width: 100%;
                        height: 1px;
                        min-height: 1px;
                    }
                }

                .fade-in {
                    animation: fadeIn 0.3s ease-in-out;
                }

                .track-panel {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .track-panel .form-group {
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .status-result {
                    width: 100%;
                    max-width: 450px;
                    text-align: left; /* Keep card text left-aligned for readability */
                }
            `}</style>
        </div>
    );
}
