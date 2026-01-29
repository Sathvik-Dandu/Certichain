import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;

      if (user.role !== "admin") {
        setMessage("You are not an admin user.");
        return;
      }

      login(user, token);
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Admin login failed.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h2 className="admin-login-title">Admin Console</h2>
        <form onSubmit={handleSubmit}>

          <div className="admin-form-group">
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <label className="admin-label">Email Address</label>
          </div>

          <div className="admin-form-group">
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <label className="admin-label">Password</label>
          </div>

          <button type="submit" className="admin-btn">
            Login to Dashboard
          </button>
        </form>
        {message && <p className="error-msg">{message}</p>}
      </div>
    </div>
  );
}
