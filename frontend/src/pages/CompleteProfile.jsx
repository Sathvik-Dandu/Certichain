import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function CompleteProfile() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        shortCode: "",
        address: "",
        website: "",
    });
    const [documents, setDocuments] = useState([]);
    const [existingDocs, setExistingDocs] = useState([]); 
    const [message, setMessage] = useState("");

    useEffect(() => {
        
        const fetchMe = async () => {
            try {
                const res = await api.get("/institutions/me");
                const { shortCode, address, website, documents } = res.data;
                setForm({
                    shortCode: shortCode || "",
                    address: address || "",
                    website: website || "",
                });
                if (documents && documents.length > 0) {
                    setExistingDocs(documents);
                }
            } catch (err) {
                console.error("Failed to fetch info", err);
            }
        };
        fetchMe();
    }, []);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleFileChange = (e) => {
        setDocuments(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        
        if (documents.length === 0 && existingDocs.length === 0) {
            setMessage("At least one verification document is required.");
            return;
        }

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            documents.forEach((file) => {
                formData.append("documents", file);
            });

            const res = await api.post("/institutions/complete-profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setMessage(res.data.message);

            if (res.data.institution) {
                
                
                
                const token = sessionStorage.getItem("token");
                login(res.data.institution, token);
            }

            setTimeout(() => {
                
                
                
                
                
                
                navigate("/institution/dashboard");
            }, 2000);

        } catch (err) {
            console.error(err);
            const msg =
                err.response?.data?.message || "Failed to submit profile.";
            setMessage(msg);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="text-center mb-2">Complete Your Profile</h2>
                <p className="text-center text-sm mb-6">
                    Please upload verification documents and confirm your details.
                    <br />
                    <span className="text-xs text-gray-500">
                        (If you already uploaded documents during registration, you can just click Submit)
                    </span>
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Short Code (e.g., cmr, iit) *</label>
                        <input
                            type="text"
                            name="shortCode"
                            value={form.shortCode}
                            onChange={handleChange}
                            required
                            className="form-input"
                            placeholder="Unique identifier for your certificates"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={form.address}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Institution Address"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Website</label>
                        <input
                            type="text"
                            name="website"
                            value={form.website}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="https://your-institution-site.edu"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Verification Documents (PDF / Images)</label>

                        {existingDocs.length > 0 && (
                            <div className="mb-2 p-2 bg-green-50 rounded text-sm text-green-700 border border-green-200">
                                 {existingDocs.length} document(s) already on file.
                            </div>
                        )}

                        <div className="file-upload-wrapper">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                accept=".pdf,.png,.jpg,.jpeg"
                                className="file-upload-input"
                            />
                            <div className="file-upload-label">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="17 8 12 3 7 8"></polyline>
                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                </svg>
                                {documents.length > 0
                                    ? `${documents.length} NEW file(s) selected`
                                    : "Upload New Files (Optional)"}
                            </div>
                        </div>
                        <p className="text-sm mt-2 text-primary" style={{ fontSize: "0.8rem" }}>
                            {documents.map(d => d.name).join(", ")}
                        </p>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        {existingDocs.length > 0 ? "Confirm & Submit Profile" : "Submit Profile"}
                    </button>
                </form>

                {message && <p className="text-center mt-4 text-primary font-bold">{message}</p>}
            </div>
        </div>
    );
}
