import { useState } from "react";
import ButtonLoader from "../components/ButtonLoader";
import api from "../services/api";

export default function FileIntegrityVerify() {
    const [form, setForm] = useState({
        certificateId: ""
    });
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setResult(null);

        if (!form.certificateId || !file) {
            setError("Certificate ID and Certificate File are required.");
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("certificateId", form.certificateId);
            formData.append("certificateFile", file);

            const res = await api.post("/certificates/public/verify-file-integrity", formData);
            setResult(res.data);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Verification failed.";
            const status = err.response?.status || "Net";
            setError(`Error (${status}): ${msg}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "3rem auto" }}>
            <div className="card">
                <h2 className="mb-4 text-center">Advanced File Integrity Check</h2>
                <p className="text-secondary text-center mb-6 text-sm">
                    Verify that your downloaded certificate file has not been tampered with by comparing its digital signature (Hash) with the original record.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Certificate ID</label>
                        <input
                            type="text"
                            name="certificateId"
                            className="form-input"
                            placeholder="e.g. cmr2510143"
                            value={form.certificateId}
                            onChange={handleChange}
                            required
                        />
                    </div>



                    <div className="form-group">
                        <label className="form-label">Upload Certificate PDF/Image</label>
                        <input
                            type="file"
                            accept=".pdf, .png, .jpg"
                            className="form-input"
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading}>
                        {isLoading ? <ButtonLoader /> : "Verify Integrity"}
                    </button>
                </form>

                {error && <div className="alert alert-danger mt-4">{error}</div>}

                {result && (
                    <div className="mt-8 border-t border-border pt-6 animate-fade-in">
                        <h3 className="text-center mb-6">Verification Results</h3>

                        {result.hashMatch ? (
                            // SUCCESS STATE
                            <div className="p-6 rounded border bg-green-500/10 border-success">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div>
                                        <h4 className="text-2xl font-bold text-success mb-2">
                                            Integrity Verified
                                        </h4>
                                        <p className="text-lg text-text-secondary font-medium">
                                            The uploaded file is identical to the original issued certificate.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-surface-alt p-6 rounded-lg mt-6 shadow-sm">
                                    <h4 className="mb-4 font-bold text-lg border-b pb-2">Genuine Record Details:</h4>
                                    <ul className="space-y-3 text-base">
                                        <li><strong className="w-24 inline-block">Student:</strong> {result.details.studentName}</li>
                                        <li><strong className="w-24 inline-block">Institution:</strong> {result.details.institutionName}</li>
                                        <li><strong className="w-24 inline-block">Course:</strong> {result.details.course}</li>
                                        <li><strong className="w-24 inline-block">Year:</strong> {result.details.year}</li>
                                        <li><strong className="w-24 inline-block">Issued:</strong> {new Date(result.details.issuedAt).toLocaleDateString()}</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            // FAILURE STATE
                            <div className="p-6 rounded border bg-red-500/10 border-danger">
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <div>
                                        <h4 className="text-2xl font-bold text-danger mb-2">
                                            Verification Failed
                                        </h4>
                                        <p className="text-lg text-text-primary font-bold">
                                            The provided certificate is not genuine.
                                        </p>
                                        <p className="text-md text-text-secondary mt-1">
                                            The uploaded file does NOT match the original record. It may have been tampered with.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
