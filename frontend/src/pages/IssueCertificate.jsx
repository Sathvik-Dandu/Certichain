
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ButtonLoader from "../components/ButtonLoader";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import StaggeredDropDown from "../components/StaggeredDropDown";
import { FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa";

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

export default function IssueCertificate() {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("single");

  useEffect(() => {
    if (location.state?.prefill) {
      const pf = location.state.prefill;
      setForm(prev => ({
        ...prev,
        studentName: pf.studentName,
        courseName: pf.courseName,
        branch: pf.branch,
        passOutYear: pf.passOutYear,
        rollNumber: pf.rollNumber,
        email: pf.email,
        requestId: pf.requestId
      }));
    }
  }, [location.state]);


  const [form, setForm] = useState({
    studentName: "",
    courseName: "",
    branch: "",
    passOutYear: "",

    rollNumber: "",
    email: "",
    requestId: ""
  });
  // File upload removed — PDFs are now auto-generated from the template


  const [bulkForm, setBulkForm] = useState({
    studentNames: "",
    courseName: "",
    branch: "",
    passOutYear: "",
    rollStart: "",
    rollEnd: "",
    manualRollNumbers: ""
  });
  const [isAutoRoll, setIsAutoRoll] = useState(true);
  // Bulk file upload removed — PDFs are now auto-generated from the template
  const [bulkFiles, setBulkFiles] = useState([]);

  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const [result, setResult] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);


  const [availableBranches, setAvailableBranches] = useState([]);


  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (name, value) => {
    if (name === "courseName") {
      const branches = COURSE_BRANCH_MAP[value] || [];
      setAvailableBranches(branches);
      setForm((prev) => ({ ...prev, courseName: value, branch: "" }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);
    setIsLoading(true);

    try {
      const payload = new FormData();
      payload.append("studentName", form.studentName);
      payload.append("courseName", form.courseName);
      payload.append("branch", form.branch);
      payload.append("passOutYear", String(form.passOutYear));
      payload.append("rollNumber", String(form.rollNumber));
      if (form.email) payload.append("email", form.email);
      if (form.requestId) payload.append("requestId", form.requestId);
      // No file upload — backend auto-generates the PDF from template

      const res = await api.post("/certificates", payload);
      setResult(res.data);
      setMessage("Certificate issued & submitted for Admin Verification.");
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Failed to issue certificate.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleBulkChange = (e) => {
    setBulkForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBulkSelectChange = (name, value) => {
    if (name === "courseName") {
      const branches = COURSE_BRANCH_MAP[value] || [];
      setAvailableBranches(branches);
      setBulkForm((prev) => ({ ...prev, courseName: value, branch: "" }));
    } else {
      setBulkForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBulkFileChange = (e) => {







    setBulkFiles(Array.from(e.target.files));
  };

  const handleMoveFile = (index, direction) => {
    const newFiles = [...bulkFiles];
    if (direction === 'up' && index > 0) {
      [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
    } else if (direction === 'down' && index < newFiles.length - 1) {
      [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
    }
    setBulkFiles(newFiles);
  };

  const handleRemoveFile = (index) => {
    const newFiles = bulkFiles.filter((_, i) => i !== index);
    setBulkFiles(newFiles);
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";

  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";



  };

  const handleDrop = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newFiles = [...bulkFiles];
    const draggedItem = newFiles[draggedItemIndex];
    newFiles.splice(draggedItemIndex, 1);
    newFiles.splice(index, 0, draggedItem);

    setBulkFiles(newFiles);
    setDraggedItemIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const generateRollNumbers = (count) => {
    if (!isAutoRoll) {

      const lines = bulkForm.manualRollNumbers.split(/\r?\n/).filter(line => line.trim() !== "");
      return lines;
    }


    const start = parseInt(bulkForm.rollStart);
    const end = parseInt(bulkForm.rollEnd);
    if (isNaN(start) || isNaN(end)) return [];

    const rolls = [];
    for (let i = start; i <= end; i++) {


      rolls.push(`${i}`);
    }
    return rolls;
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);
    setIsLoading(true);
    setBulkProgress({ current: 0, total: 0 });

    try {

      const names = bulkForm.studentNames.split(/\r?\n/).filter(line => line.trim() !== "");


      const rolls = generateRollNumbers(names.length);


      if (names.length === 0) throw new Error("Please enter at least one student name.");

      if (isAutoRoll) {
        const start = parseInt(bulkForm.rollStart);
        const end = parseInt(bulkForm.rollEnd);
        if ((end - start + 1) !== names.length) {
          throw new Error(`Roll number range (${end - start + 1}) does not match number of students (${names.length}).`);
        }
      }

      if (rolls.length !== names.length) {
        throw new Error(`Number of roll numbers (${rolls.length}) does not match number of students (${names.length}).`);
      }

      if (bulkFiles.length > 0 && bulkFiles.length !== names.length) {
        throw new Error(`Number of files selected (${bulkFiles.length}) does not match number of students (${names.length}). Ensure files are selected in order.`);
      }


      setBulkProgress({ current: 0, total: names.length });

      const results = [];
      const errors = [];


      for (let i = 0; i < names.length; i++) {
        try {
          const payload = new FormData();
          payload.append("studentName", names[i]);
          payload.append("courseName", bulkForm.courseName);
          payload.append("branch", bulkForm.branch);
          payload.append("passOutYear", String(bulkForm.passOutYear));
          payload.append("rollNumber", rolls[i]);

          if (bulkFiles[i]) {
            payload.append("certificateFile", bulkFiles[i]);
          }


          const res = await api.post("/certificates", payload);

          results.push({
            name: names[i],
            status: "success",
            certificateId: res.data.certificateId,
            verificationUrl: res.data.verificationUrl
          });
        } catch (itemErr) {
          console.error(`Error for ${names[i]}:`, itemErr);
          errors.push({
            name: names[i],
            error: itemErr.response?.data?.message || itemErr.message || "Failed"
          });
        }


        setBulkProgress(prev => ({ ...prev, current: i + 1 }));
      }

      const successCount = results.length;
      const errorCount = errors.length;
      setMessage(`Bulk process complete. Success: ${successCount}, Failed: ${errorCount}`);

      setResult({ bulkResults: { results, errors } });

    } catch (err) {
      console.error(err);
      setMessage(err.message || err.response?.data?.message || "Failed to process bulk upload.");
    } finally {
      setIsLoading(false);

    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "4rem auto" }}>
      <div className="card">
        <h2 className="mb-4">Issue Certificate</h2>
        <p className="mb-6 text-sm" style={{ backgroundColor: "var(--surface-alt)", padding: "0.5rem", borderRadius: "var(--radius-sm)", display: "inline-block" }}>
          Logged in as: <strong style={{ color: "var(--primary)" }}>{user?.name}</strong>
        </p>

        <div className="flex mb-6 gap-2">
          <button
            className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab("single"); setMessage(""); setResult(null); setBulkProgress({ current: 0, total: 0 }); }}
          >
            Single Issue
          </button>
          <button
            className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab("bulk"); setMessage(""); setResult(null); }}
          >
            Bulk Upload
          </button>
        </div>

        {activeTab === 'single' ? (
          <form onSubmit={handleSingleSubmit}>
            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input
                type="text"
                name="studentName"
                className="form-input"
                value={form.studentName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Course Name</label>
              <StaggeredDropDown
                options={COURSE_OPTIONS}
                onSelect={(val) => handleSelectChange("courseName", val)}
                placeholder="Select Course"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Branch</label>
              <StaggeredDropDown
                key={`single-${form.courseName}`}
                options={availableBranches.length > 0 ? availableBranches : ["Select a course first"]}
                onSelect={(val) => handleSelectChange("branch", val)}
                placeholder="Select Branch"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Pass-out Year</label>
                <input
                  type="number"
                  name="passOutYear"
                  className="form-input"
                  placeholder="YYYY"
                  min="1900"
                  max="2100"
                  value={form.passOutYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <input
                  type="number"
                  name="rollNumber"
                  className="form-input"
                  placeholder="e.g. 10143"
                  value={form.rollNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Student Email (for notification)</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="student@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            {/* File upload removed — PDFs are auto-generated from template */}

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45px' }}>
              {isLoading ? <ButtonLoader /> : "Issue Certificate"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBulkSubmit}>
            <div className="alert alert-info mb-4" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Bulk upload allows issuing multiple certificates for the same Course & Branch.
            </div>

            <div className="form-group">
              <label className="form-label">Course Name</label>
              <StaggeredDropDown
                options={COURSE_OPTIONS}
                onSelect={(val) => handleBulkSelectChange("courseName", val)}
                placeholder="Select Course"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Branch</label>
              <StaggeredDropDown
                key={`bulk-${bulkForm.courseName}`}
                options={availableBranches.length > 0 ? availableBranches : ["Select a course first"]}
                onSelect={(val) => handleBulkSelectChange("branch", val)}
                placeholder="Select Branch"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Pass-out Year</label>
              <input
                type="number"
                name="passOutYear"
                className="form-input"
                placeholder="YYYY"
                min="1900"
                max="2100"
                value={bulkForm.passOutYear}
                onChange={handleBulkChange}
                required
              />
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Student Names (One per line)</label>
              <textarea
                name="studentNames"
                className="form-input"
                rows="5"
                placeholder="Alice Smith&#10;Bob Jones&#10;Charlie Brown"
                value={bulkForm.studentNames}
                onChange={handleBulkChange}
                required
              ></textarea>
            </div>

            <div className="form-group mt-4 border p-4 rounded border-border">
              <div className="flex justify-between items-center mb-2">
                <label className="form-label mb-0">Roll Numbers</label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoRoll"
                    checked={isAutoRoll}
                    onChange={(e) => setIsAutoRoll(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="autoRoll" className="text-sm cursor-pointer select-none">Auto-generate</label>
                </div>
              </div>

              {isAutoRoll ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-text-secondary">Start (e.g. 101)</label>
                    <input
                      type="number"
                      name="rollStart"
                      value={bulkForm.rollStart}
                      onChange={handleBulkChange}
                      className="form-input text-sm"
                      placeholder="Start"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-text-secondary">End (e.g. 110)</label>
                    <input
                      type="number"
                      name="rollEnd"
                      value={bulkForm.rollEnd}
                      onChange={handleBulkChange}
                      className="form-input text-sm"
                      placeholder="End"
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  name="manualRollNumbers"
                  className="form-input"
                  rows="5"
                  placeholder="101&#10;102&#10;103"
                  value={bulkForm.manualRollNumbers}
                  onChange={handleBulkChange}
                ></textarea>
              )}
            </div>

            {/* Bulk file upload removed — PDFs are auto-generated from template */}

            <button type="submit" className="btn btn-primary w-full mt-4" disabled={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45px' }}>
              {isLoading ? <ButtonLoader /> : "Bulk Issue Certificates"}
            </button>

            {bulkProgress.total > 0 && (
              <div className="mt-4 mb-2">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>{bulkProgress.current === bulkProgress.total ? "Upload Complete" : "Uploading..."}</span>
                  <span className="font-bold">{bulkProgress.current} / {bulkProgress.total}</span>
                </div>
                <div className="w-full bg-surface-alt rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

          </form>
        )}

        {message && <p className={`mt-4 text-center ${message.includes("success") || message.includes("complete") ? "text-success" : "text-danger"}`}>{message}</p>}

        {result && activeTab === 'single' && (
          <div className="mt-8 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <h3>Certificate Details</h3>
            <p><strong>Certificate ID:</strong> {result.certificateId}</p>
            {result.verificationUrl && (
              <p>
                <strong>Certificate Verification URL:</strong>{" "}
                <a href={result.verificationUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  {result.verificationUrl}
                </a>
              </p>
            )}
          </div>
        )}

        {result && activeTab === 'bulk' && result.bulkResults && (
          <div className="mt-8 pt-4 overflow-x-auto" style={{ borderTop: "1px solid var(--border)" }}>
            <h3>Bulk Results</h3>
            <table className="w-full text-sm mt-2">
              <thead>
                <tr className="text-left border-b border-border">
                  <th className="p-2">Name</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Certificate ID</th>
                  <th className="p-2">Verification Link</th>
                </tr>
              </thead>
              <tbody>
                {result.bulkResults.results.map((r, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="p-2">{r.name}</td>
                    <td className="p-2 text-success">Success</td>
                    <td className="p-2">{r.certificateId}</td>
                    <td className="p-2">
                      {r.verificationUrl ? (
                        <a href={r.verificationUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                          {r.verificationUrl}
                        </a>
                      ) : "N/A"}
                    </td>
                  </tr>
                ))}
                {result.bulkResults.errors.map((e, i) => (
                  <tr key={`err-${i}`} className="border-b border-border bg-red-50 dark:bg-red-900/20">
                    <td className="p-2">{e.name}</td>
                    <td className="p-2 text-danger">Failed</td>
                    <td className="p-2 text-danger" colSpan="2">{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
