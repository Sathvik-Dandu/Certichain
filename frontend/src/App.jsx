
import React from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { FaSun, FaMoon, FaBars, FaTimes } from "react-icons/fa";

import LandingPage from "./pages/LandingPage";
import VerifyPortal from "./pages/VerifyPortal";
import VerifyResult from "./pages/VerifyResult";
import FileIntegrityVerify from "./pages/FileIntegrityVerify";
import InstitutionAuth from "./pages/InstitutionAuth";
import IssueCertificate from "./pages/IssueCertificate";
import CertificateView from "./pages/CertificateView";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import CompleteProfile from "./pages/CompleteProfile";
import RequestCertificate from "./pages/RequestCertificate";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Security from "./pages/Security";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/institution/portal");
    setIsMenuOpen(false);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>Certichain.</Link>

        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Navigation"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className={`navbar-nav ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/verify" className={isActive("/verify")} onClick={closeMenu}>Verify</Link>
          <Link to="/request-certificate" className={isActive("/request-certificate")} onClick={closeMenu}>Request Certificate</Link>

          {!user && (
            <>
              <Link to="/institution/portal" className={isActive("/institution/portal")} onClick={closeMenu}>Institution Portal</Link>
              <Link to="/admin/login" className={isActive("/admin/login")} onClick={closeMenu}>Admin Panel</Link>
            </>
          )}

          {user && (
            <>
              {user.role === "institution" && (
                <>
                  <Link to="/institution/issue" className={isActive("/institution/issue")} onClick={closeMenu}>Issue Certificate</Link>
                  <Link to="/institution/dashboard" className={isActive("/institution/dashboard")} onClick={closeMenu}>Dashboard</Link>
                </>
              )}

              {user.role === "admin" && (
                <Link to="/admin/dashboard" className={isActive("/admin/dashboard")} onClick={closeMenu}>Admin Dashboard</Link>
              )}

              <button onClick={handleLogout} className="btn btn-secondary btn-sm" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                Logout ({user.name})
              </button>
            </>
          )}

          <div className="theme-toggle-wrapper">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

function ProtectedInstitutionRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "institution") {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2>Access Denied</h2>
          <p>Please login as an institution to access this page.</p>
          <Link to="/institution/portal" className="btn btn-primary mt-4">Go to Login</Link>
        </div>
      </div>
    );
  }
  return children;
}

function ProtectedAdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") {
    return (
      <div className="container" style={{ marginTop: "4rem", textAlign: "center" }}>
        <div className="card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <h2>Access Denied</h2>
          <p>Admin access only.</p>
          <Link to="/admin/login" className="btn btn-primary mt-4">Go to Admin Login</Link>
        </div>
      </div>
    );
  }
  return children;
}



function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary"
      style={{
        padding: "0.5rem",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        fontSize: "1.2rem",
        border: "1px solid var(--border)"
      }}
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <FaMoon /> : <FaSun style={{ color: "var(--warning)" }} />}
    </button>
  );
}

import Footer from "./components/Footer";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Navbar />
        <div className="page-wrapper container" style={{ maxWidth: '100%', padding: 0, display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/verify" element={<VerifyPortal />} />
              <Route path="/verify/:certificateId" element={<VerifyResult />} />
              <Route path="/verify-integrity" element={<FileIntegrityVerify />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/security" element={<Security />} />
              <Route path="/request-certificate" element={<RequestCertificate />} />
              <Route path="/institution/portal" element={<InstitutionAuth />} />
              <Route path="/institution/register" element={<InstitutionAuth />} />
              <Route path="/institution/complete-profile" element={<CompleteProfile />} />
              <Route
                path="/institution/issue"
                element={
                  <ProtectedInstitutionRoute>
                    <IssueCertificate />
                  </ProtectedInstitutionRoute>
                }
              />
              <Route
                path="/institution/dashboard"
                element={
                  <ProtectedInstitutionRoute>
                    <InstitutionDashboard />
                  </ProtectedInstitutionRoute>
                }
              />
              <Route path="/cert/:certificateId" element={<CertificateView />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

