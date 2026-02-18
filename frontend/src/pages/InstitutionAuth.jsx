import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiLock, FiMail, FiMapPin, FiGlobe, FiFileText } from "react-icons/fi";

import "./InstitutionAuth.css";

export default function InstitutionAuth() {
    const [active, setActive] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();



    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false); // New state
    const [loginMessage, setLoginMessage] = useState("");



    const [showRegisterPassword, setShowRegisterPassword] = useState(false); // New state for register form

    const [registerForm, setRegisterForm] = useState({
        name: "",
        registrarName: "",
        shortCode: "",
        email: "",
        password: "",

        address: "",
        website: "",
    });
    const [documents, setDocuments] = useState([]);
    const [registerMessage, setRegisterMessage] = useState("");


    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginMessage("");

        try {
            const res = await api.post("/institutions/login", { email: loginEmail, password: loginPassword });
            const { token, institution } = res.data;

            login(
                {
                    id: institution.id,
                    name: institution.name,
                    email: institution.email,
                    role: "institution",
                },
                token
            );
            navigate("/institution/dashboard");
        } catch (err) {
            console.error(err);
            setLoginMessage(err.response?.data?.message || "Login failed.");
        }
    };


    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setDocuments(Array.from(e.target.files));
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();


        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(registerForm.password)) {
            setRegisterMessage("Password must be 8+ chars, 1 uppercase, 1 number, 1 special char.");
            return;
        }

        setRegisterMessage("");

        try {
            const formData = new FormData();
            Object.entries(registerForm).forEach(([key, value]) => {
                formData.append(key, value);
            });
            documents.forEach((file) => {
                formData.append("documents", file);
            });

            const res = await api.post("/institutions/register", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });


            const { token, institution } = res.data;
            login(
                {
                    id: institution.id,
                    name: institution.name,
                    email: institution.email,
                    role: "institution",
                },
                token
            );
            navigate("/institution/dashboard");


            setRegisterForm({ name: "", registrarName: "", shortCode: "", email: "", password: "", address: "", website: "" });
            setDocuments([]);
        } catch (err) {
            console.error(err);
            setRegisterMessage(err.response?.data?.message || "Registration failed.");
        }
    };

    return (
        <div className="institution-auth-wrapper">
            <div className={`institution-auth-container ${active ? "active" : ""}`}>
                <div className="curved-shape"></div>
                <div className="curved-shape2"></div>

                <div className="form-box Login">
                    <h2 className="animation" style={{ "--D": 0, "--S": 21 }}>Login</h2>
                    <form onSubmit={handleLoginSubmit}>
                        <div className="input-box animation" style={{ "--D": 1, "--S": 22 }}>
                            <label className="block mb-1">Email</label>
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                            <FiUser className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--D": 2, "--S": 23 }}>
                            <label className="block mb-1">Password</label>
                            <div style={{ position: "relative", width: "100%" }}>
                                <input
                                    type={showLoginPassword ? "text" : "password"}
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                    required
                                    className="pr-10" // Add padding to prevent text overlap
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    // className="absolute right-3 top-1/2 -translate-y-1/2 ..." // Tailwind classes might be failing
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280', // text-gray-500
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        zIndex: 10
                                    }}
                                >
                                    {showLoginPassword ? "👁️" : "👁"}
                                </button>
                            </div>
                            {/*  <FiLock className="icon text-gray-500 pointer-events-none" />  Existing icon is hidden via CSS, so we can leave it or remove it. Prompt said "Do NOT change: Existing styling system". The CSS hides .icon. I will leave it to be safe, or remove it if it interferes. The prompt says "Apply to every password-type field". I will execute the change. */}
                            {/* The previous icon logic was <FiLock ... /> outside the input but inside div.input-box. The CSS hides it. I will keep it to minimize changes unless it overlaps visually. The new button is absolute right-3. The old icon might be okay. */}
                            <FiLock className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--D": 3, "--S": 24 }}>
                            <button className="btn" type="submit">Login</button>
                        </div>

                        {loginMessage && (
                            <p className="animation text-center" style={{ color: "#ef4444", marginTop: "1rem", "--D": 4, "--S": 25 }}>
                                {loginMessage}
                            </p>
                        )}

                        <div className="text-right mt-2 animation" style={{ "--D": 3, "--S": 24 }}>
                            {/* Added Forgot Password Link */}
                            <a href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300">
                                Forgot Password?
                            </a>
                        </div>

                        <div className="regi-link animation" style={{ "--D": 4, "--S": 25 }}>
                            <p>Don't have an account? <br /> <a href="#" onClick={(e) => { e.preventDefault(); setActive(true); }}>Sign Up</a></p>
                        </div>
                    </form>
                </div>

                <div className="info-content Login">
                    <h2 className="animation" style={{ "--D": 0, "--S": 20 }}>WELCOME BACK!</h2>
                    <p className="animation" style={{ "--D": 1, "--S": 21 }}>
                        We are happy to have you with us again. Log in to access your dashboard.
                    </p>
                </div>

                <div className="form-box Register">
                    <h2 className="animation" style={{ "--li": 17, "--S": 0 }}>Register</h2>
                    <form onSubmit={handleRegisterSubmit}>
                        <div className="input-box animation" style={{ "--li": 18, "--S": 1 }}>
                            <label className="block mb-1">Institution Name</label>
                            <input
                                type="text"
                                name="name"
                                value={registerForm.name}
                                onChange={handleRegisterChange}
                                required
                            />
                            <FiUser className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 18, "--S": 1 }}>
                            <label className="block mb-1">Registrar Name</label>
                            <input
                                type="text"
                                name="registrarName"
                                value={registerForm.registrarName}
                                onChange={handleRegisterChange}
                                required
                            />
                            <FiUser className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 18, "--S": 1 }}>
                            <label className="block mb-1">Short Code</label>
                            <input
                                type="text"
                                name="shortCode"
                                value={registerForm.shortCode}
                                onChange={handleRegisterChange}
                                required
                            />
                            <FiFileText className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 19, "--S": 2 }}>
                            <label className="block mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={registerForm.email}
                                onChange={handleRegisterChange}
                                required
                            />
                            <FiMail className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 19, "--S": 3 }}>
                            <label className="block mb-1">Password</label>
                            <div style={{ position: "relative", width: "100%" }}>
                                <input
                                    type={showRegisterPassword ? "text" : "password"}
                                    name="password"
                                    value={registerForm.password}
                                    onChange={handleRegisterChange}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#6b7280',
                                        padding: '0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        zIndex: 10
                                    }}
                                >
                                    {showRegisterPassword ? "👁️" : "👁"}
                                </button>
                            </div>
                            <FiLock className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 20, "--S": 4 }}>
                            <label className="block mb-1">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={registerForm.address}
                                onChange={handleRegisterChange}
                            />
                            <FiMapPin className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 20, "--S": 4 }}>
                            <label className="block mb-1">Website</label>
                            <input
                                type="text"
                                name="website"
                                value={registerForm.website}
                                onChange={handleRegisterChange}
                            />
                            <FiGlobe className="icon text-gray-500 pointer-events-none" />
                        </div>
                        <div className="input-box file-input animation" style={{ "--li": 20, "--S": 4 }}>
                            <div className="file-upload-wrapper">
                                <label className="block mb-1">Upload Documents</label>
                                <input
                                    id="institution-file-upload"
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full p-2 rounded block"
                                />
                                {documents.length > 0 && (
                                    <ul className="mt-2 text-gray-900 dark:text-white list-disc pl-5">
                                        {documents.map((file, i) => (
                                            <li key={i}>{file.name}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        <div className="input-box animation" style={{ "--li": 20, "--S": 4 }}>
                            <button className="btn" type="submit">Register</button>
                        </div>


                        {registerMessage && (
                            <p className="animation text-center" style={{ color: "#fff", marginTop: "1rem", fontWeight: "bold", "--li": 21, "--S": 5 }}>
                                {registerMessage}
                            </p>
                        )}

                        <div className="regi-link animation" style={{ "--li": 21, "--S": 5 }}>
                            <p>Already have an account? <br /> <a href="#" onClick={(e) => { e.preventDefault(); setActive(false); }}>Sign In</a></p>
                        </div>
                    </form>
                </div>

                <div className="info-content Register">
                    <h2 className="animation" style={{ "--li": 17, "--S": 0 }}>WELCOME!</h2>
                    <p className="animation" style={{ "--li": 18, "--S": 1 }}>
                        Join CertiChain to issue tamper-proof certificates.
                    </p>
                </div>
            </div>
        </div>
    );
}
