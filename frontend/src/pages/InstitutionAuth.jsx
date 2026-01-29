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
    const [loginMessage, setLoginMessage] = useState("");


    const [registerForm, setRegisterForm] = useState({
        name: "",
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


            setRegisterForm({ name: "", shortCode: "", email: "", password: "", address: "", website: "" });
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
                            <input
                                type="email"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                required
                            />
                            <label>Email</label>
                            <FiUser className="icon" />
                        </div>
                        <div className="input-box animation" style={{ "--D": 2, "--S": 23 }}>
                            <input
                                type="password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                            <label>Password</label>
                            <FiLock className="icon" />
                        </div>
                        <div className="input-box animation" style={{ "--D": 3, "--S": 24 }}>
                            <button className="btn" type="submit">Login</button>
                        </div>

                        {loginMessage && (
                            <p className="animation text-center" style={{ color: "#ef4444", marginTop: "1rem", "--D": 4, "--S": 25 }}>
                                {loginMessage}
                            </p>
                        )}

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
                            <input
                                type="text"
                                name="name"
                                value={registerForm.name}
                                onChange={handleRegisterChange}
                                required
                            />
                            <label>Institution Name</label>
                            <FiUser className="icon" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 18, "--S": 1 }}>
                            <input
                                type="text"
                                name="shortCode"
                                value={registerForm.shortCode}
                                onChange={handleRegisterChange}
                                required
                            />
                            <label>Short Code</label>
                            <FiFileText className="icon" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 19, "--S": 2 }}>
                            <input
                                type="email"
                                name="email"
                                value={registerForm.email}
                                onChange={handleRegisterChange}
                                required
                            />
                            <label>Email</label>
                            <FiMail className="icon" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 19, "--S": 3 }}>
                            <input
                                type="password"
                                name="password"
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                required
                            />
                            <label>Password</label>
                            <FiLock className="icon" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 20, "--S": 4 }}>
                            <input
                                type="text"
                                name="address"
                                value={registerForm.address}
                                onChange={handleRegisterChange}
                            />
                            <label>Address</label>
                            <FiMapPin className="icon" />
                        </div>
                        <div className="input-box animation" style={{ "--li": 20, "--S": 4 }}>
                            <input
                                type="text"
                                name="website"
                                value={registerForm.website}
                                onChange={handleRegisterChange}
                            />
                            <label>Website</label>
                            <FiGlobe className="icon" />
                        </div>
                        <div className="input-box file-input animation" style={{ "--li": 20, "--S": 4 }}>
                            <div className="file-upload-wrapper">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    className="file-upload-input"
                                />
                                <div className="file-upload-label">
                                    {documents.length > 0 ? `${documents.length} files` : "Upload Documents"}
                                </div>
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
