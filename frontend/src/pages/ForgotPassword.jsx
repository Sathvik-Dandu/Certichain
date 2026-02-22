import { useState } from "react";
import api from "../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/institutions/forgot-password", { email });
            setMessage(res.data.message || "If an account exists, a reset link has been sent.");
        } catch (err) {
            console.error(err);
            // Always show specific success message for security, or generic error
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="institution-auth-wrapper" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div className="institution-auth-container active" style={{ height: "auto", minHeight: "500px", padding: "2rem" }}>
                <div className="curved-shape"></div>
                <div className="curved-shape2"></div>

                <div className="form-box" style={{ width: "100%", position: "relative", transform: "none", transition: "none", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <h2 className="animation" style={{ "--D": 0, "--S": 21, textAlign: "center", width: "100%", marginBottom: "1rem" }}>Forgot Password</h2>
                    <p className="animation text-center" style={{ "--D": 1, "--S": 22, color: "var(--text-secondary)", marginBottom: "2rem" }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-box animation" style={{ "--D": 2, "--S": 23, width: "100%" }}>
                            <label className="block mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-box animation" style={{ "--D": 3, "--S": 24, width: "100%" }}>
                            <button className="btn" type="submit" disabled={loading} style={{ width: "100%", marginTop: "1rem" }}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </div>

                        {message && (
                            <p className="animation text-center" style={{ color: "var(--success)", marginTop: "1.5rem", fontWeight: "bold", "--D": 4, "--S": 25 }}>
                                {message}
                            </p>
                        )}

                        {error && (
                            <p className="animation text-center" style={{ color: "var(--danger)", marginTop: "1.5rem", fontWeight: "bold", "--D": 4, "--S": 25 }}>
                                {error}
                            </p>
                        )}

                        <div className="text-center mt-4 animation" style={{ "--D": 5, "--S": 26, width: "100%" }}>
                            <a href="/institution/auth" className="text-sm" style={{ color: "var(--primary)", textDecoration: "underline" }}>
                                Back to Login
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
