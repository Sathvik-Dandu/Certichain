
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function VerifyPortal() {

  const [searchMode, setSearchMode] = useState("id");
  const [certificateId, setCertificateId] = useState("");
  const [idError, setIdError] = useState("");


  const [institutions, setInstitutions] = useState([]);
  const [filters, setFilters] = useState({
    institution: "",
    year: "",
    branch: "",
  });
  const [manualError, setManualError] = useState("");
  const [manualResults, setManualResults] = useState([]);
  const [loadingManual, setLoadingManual] = useState(false);





  // File Integrity State
  const [integrityId, setIntegrityId] = useState("");
  const [integrityFile, setIntegrityFile] = useState(null);
  const [verifyingIntegrity, setVerifyingIntegrity] = useState(false);
  const [integrityResult, setIntegrityResult] = useState(null);
  const [integrityError, setIntegrityError] = useState("");


  const navigate = useNavigate();


  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const res = await api.get("/institutions/public/list");
        setInstitutions(res.data);
      } catch (err) {
        console.error("Failed to load institutions", err);
      }
    };
    fetchInstitutions();
  }, []);


  const handleSearchById = (e) => {
    e.preventDefault();
    setIdError("");

    const trimmed = certificateId.trim();
    if (!trimmed) {
      setIdError("Please enter a certificate ID.");
      return;
    }


    navigate(`/verify/${trimmed}`);
  };


  const handleManualSearch = async (e) => {
    e.preventDefault();
    setManualError("");
    setManualResults([]);

    try {
      setLoadingManual(true);

      const res = await api.get("/public/search", {
        params: filters
      });

      setManualResults(res.data);
      if (res.data.length === 0) {
        setManualError("No certificates found for the selected filters.");
      }
    } catch (err) {
      console.error(err);
      setManualError("Error while fetching certificates. Please try again.");
    } finally {
      setLoadingManual(false);
    }
  };





  const handleIntegrityVerify = async (e) => {
    e.preventDefault();
    setVerifyingIntegrity(true);
    setIntegrityError("");
    setIntegrityResult(null);

    if (!integrityId || !integrityFile) {
      setIntegrityError("Certificate ID and Certificate File are required.");
      setVerifyingIntegrity(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("certificateId", integrityId);
      formData.append("certificateFile", integrityFile);

      const res = await api.post("/certificates/public/verify-file-integrity", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIntegrityResult(res.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Verification failed.";
      const status = err.response?.status || "Net";
      setIntegrityError(`Error (${status}): ${msg}`);
    } finally {
      setVerifyingIntegrity(false);
    }
  };


  const branchOptions = [
    "cse", "aiml", "cs", "it", "ece", "iot", "mechanical"
  ];

  return (
    <div style={{ padding: '4rem 1rem' }}>
      <div className="text-center mb-8" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="mb-4">CertiChain Verification Portal</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          Welcome to the official credential verification system.
          Enter a certificate ID below to instantly validate authenticity against the blockchain.
        </p>
      </div>

      <div className="card" style={{ maxWidth: "800px", margin: "0 auto", padding: "4rem", minHeight: "600px", display: "flex", flexDirection: "column" }}>
        <h3 className="text-center mb-6">Verification Method</h3>
        <p className="text-center mb-6 text-secondary">Choose how you would like to search for a record:</p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem", justifyContent: 'center' }}>
          <button
            onClick={() => setSearchMode("id")}
            className={`btn ${searchMode === "id" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, minWidth: "120px" }}
          >
            By ID
          </button>
          <button
            onClick={() => setSearchMode("manual")}
            className={`btn ${searchMode === "manual" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, minWidth: "120px" }}
          >
            Manual Search
          </button>

          <button
            onClick={() => setSearchMode("integrity")}
            className={`btn ${searchMode === "integrity" ? "btn-primary" : "btn-secondary"}`}
            style={{ flex: 1, minWidth: "120px" }}
          >
            Using SHA-256 Verification
          </button>


        </div>

        <div style={{ padding: "10px", minHeight: "300px" }}>

          {searchMode === "id" && (
            <div className="animate-fade-in" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
              <h4 className="mb-4">Verify by ID</h4>
              <p className="text-sm mb-4">
                Enter the unique certificate ID found on the document (e.g., <code>cmr2510143</code>).
              </p>
              <form onSubmit={handleSearchById}>
                <div className="form-group">
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Enter Certificate ID"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full" style={{ padding: '1rem' }}>Verify Certificate</button>
              </form>
              {idError && <p className="text-danger mt-2">{idError}</p>}
            </div>
          )}

          {searchMode === "manual" && (
            <div>
              <h4>Search Manually</h4>
              <p className="text-sm mb-4">
                Filter certificates by college, year of passing, and branch.
              </p>

              <form onSubmit={handleManualSearch}>
                <div className="form-group">
                  <label className="form-label">Institution</label>
                  <select
                    className="form-select"
                    value={filters.institution}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        institution: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((inst) => (
                      <option key={inst._id} value={inst.name}>
                        {inst.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Year of Passing</label>
                  <select
                    className="form-select"
                    value={filters.year}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        year: e.target.value,
                      }))
                    }
                  >
                    <option value="">Year</option>
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select
                    className="form-select"
                    value={filters.branch}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        branch: e.target.value,
                      }))
                    }
                  >
                    <option value="">Branch</option>
                    {branchOptions.map((b) => (
                      <option key={b} value={b}>
                        {b.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={loadingManual}>
                  {loadingManual ? "Searching..." : "Search"}
                </button>
              </form>

              {manualError && (
                <p className="text-danger mt-2">{manualError}</p>
              )}
            </div>
          )}



          {searchMode === "integrity" && (
            <div>
              <h4>Advanced File Integrity Check</h4>
              <p className="text-sm mb-4">
                Verify that your downloaded certificate file has not been tampered with by comparing it with the original record.
              </p>
              <form onSubmit={handleIntegrityVerify}>
                <div className="form-group">
                  <label className="form-label">Certificate ID</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. cmr2510143"
                    value={integrityId}
                    onChange={(e) => setIntegrityId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Certificate PDF/Image</label>
                  <input
                    type="file"
                    accept=".pdf, .png, .jpg"
                    className="form-input"
                    onChange={(e) => setIntegrityFile(e.target.files[0])}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full" disabled={verifyingIntegrity}>
                  {verifyingIntegrity ? "Verifying..." : "Verify Integrity"}
                </button>
              </form>

              {integrityError && <div className="alert alert-danger mt-4">{integrityError}</div>}

              {integrityResult && (
                <div className="mt-8 border-t border-border pt-6 animate-fade-in">
                  <h3 className="text-center mb-6">Verification Results</h3>

                  {integrityResult.hashMatch ? (
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
                          <li><strong className="w-24 inline-block">Student:</strong> {integrityResult.details.studentName}</li>
                          <li><strong className="w-24 inline-block">Institution:</strong> {integrityResult.details.institutionName}</li>
                          <li><strong className="w-24 inline-block">Course:</strong> {integrityResult.details.course}</li>
                          <li><strong className="w-24 inline-block">Year:</strong> {integrityResult.details.year}</li>
                          <li><strong className="w-24 inline-block">Issued:</strong> {new Date(integrityResult.details.issuedAt).toLocaleDateString()}</li>
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
          )}

        </div>

        {manualResults.length > 0 && searchMode === "manual" && (
          <div className="mt-8">
            <h4>Results</h4>
            <ul style={{ listStyle: "none", padding: 0 }} className="mt-4">
              {manualResults.map((cert) => (
                <li
                  key={cert.certificateId}
                  style={{
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "1rem",
                    marginBottom: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "var(--background)"
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>
                      {cert.studentName} <span className="text-sm text-light">({cert.certificateId})</span>
                    </div>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {cert.branch ? cert.branch.toUpperCase() : "N/A"} • {cert.passOutYear || "N/A"}
                    </div>
                  </div>
                  <button onClick={() => navigate(`/verify/${cert.certificateId}`)} className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                    View Certificate
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div >
  );
}
