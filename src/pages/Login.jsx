// ============================================================
// Login.jsx — Campus Authentication Page
// Supports Login and Signup with smooth tab toggle
// ============================================================

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShield,
  faEnvelope,
  faLock,
  faUserTag,
  faTriangleExclamation,
  faArrowRight,
  faSpinner,
  faUser,
  faBuilding,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";

const SIGNUP_ROLES = ["Student", "Faculty", "Lab Assistant"];
const ROLES = ["Admin", "Faculty", "Student", "Lab Assistant"];
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FALLBACK_DEMO_CREDS = [
  { role: "Admin", email: "admin@college.edu", password: "admin123" },
  { role: "Faculty", email: "faculty@college.edu", password: "faculty123" },
  { role: "Student", email: "student@college.edu", password: "student123" },
  { role: "Lab Assistant", email: "lab@college.edu", password: "lab123" },
];

const CAMPUS_FEATURES = [
  { icon: "🧪", text: "Lab & Facility Booking" },
  { icon: "📅", text: "Real-Time Scheduling" },
  { icon: "🔐", text: "Role-Based Access" },
  { icon: "🏛️", text: "Department Management" },
];

const Login = () => {
  const { login, authError, currentUser, darkMode, setDarkMode } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ email: "", password: "", role: "Student" });
  const [signupForm, setSignupForm] = useState({
    name: "", email: "", password: "", confirmPassword: "", role: "Student", departmentId: "",
  });
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [demoCreds, setDemoCreds] = useState(FALLBACK_DEMO_CREDS);
  const [departments, setDepartments] = useState([]);

  useEffect(() => { if (currentUser) navigate("/dashboard"); }, [currentUser, navigate]);

  // Load demo credentials from backend
  useEffect(() => {
    const loadDemoCreds = async () => {
      try {
        const res = await fetch(`${API_BASE}/demo-credentials`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.demoCredentials) && data.demoCredentials.length > 0) {
          setDemoCreds(data.demoCredentials);
        }
      } catch { /* use fallback */ }
    };
    loadDemoCreds();
  }, []);

  // Load departments for signup
  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/departments`);
        const data = await res.json();
        if (res.ok && data.departments) setDepartments(data.departments);
      } catch { /* ignore */ }
    };
    loadDepts();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  const handleSignupChange = (e) => setSignupForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const success = await login(form.email, form.password, form.role);
    setLoading(false);
    if (success) navigate("/dashboard");
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (!signupForm.name.trim()) return setSignupError("Full name is required");
    if (!signupForm.email.trim()) return setSignupError("Email is required");
    if (signupForm.password.length < 3) return setSignupError("Password must be at least 3 characters");
    if (signupForm.password !== signupForm.confirmPassword) return setSignupError("Passwords do not match");
    if (!signupForm.departmentId) return setSignupError("Please select a department");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupForm.name,
          email: signupForm.email,
          password: signupForm.password,
          role: signupForm.role,
          departmentId: Number(signupForm.departmentId),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSignupError(data.message || "Signup failed");
      } else {
        setSignupSuccess(true);
        setTimeout(() => {
          setSignupSuccess(false);
          setMode("login");
          setForm({ email: signupForm.email, password: signupForm.password, role: signupForm.role });
          setSignupForm({ name: "", email: "", password: "", confirmPassword: "", role: "Student", departmentId: "" });
        }, 2000);
      }
    } catch {
      setSignupError("Network error — check your connection");
    }
    setLoading(false);
  };

  const fillDemo = (cred) => setForm({ email: cred.email, password: cred.password, role: cred.role });

  const toggleDark = () => {
    setDarkMode((d) => !d);
    document.documentElement.setAttribute("data-theme", !darkMode ? "dark" : "light");
  };

  const switchMode = (m) => {
    setMode(m);
    setSignupError("");
    setSignupSuccess(false);
  };

  return (
    <div className="login-page">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDark}
        style={{
          position: "absolute", top: 20, right: 20,
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
          borderRadius: 8, color: "white", padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 8,
          fontSize: 13, fontWeight: 600, cursor: "pointer",
          backdropFilter: "blur(8px)", zIndex: 10,
        }}
        id="login-theme-toggle"
      >
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {/* ── Left Hero Panel ── */}
      <div className="login-hero">
        <div className="login-hero-bg" />
        <div className="login-hero-brand">
          <div className="login-hero-icon"><FontAwesomeIcon icon={faShield} /></div>
          <h1 className="login-hero-title">Gate<span>Keeper</span>X</h1>
        </div>
        <div className="login-hero-headline">
          <span className="hero-eyebrow">🎓 Smart Campus Platform</span>
          <h2>Empowering<br />Smart Campuses</h2>
          <p className="hero-tagline">"Smart Access. Seamless Control."</p>
          <p className="hero-desc">
            Manage, monitor, and optimize college resources with a unified platform.
            Streamline booking across departments with real-time availability.
          </p>
        </div>
        <div className="campus-features">
          {CAMPUS_FEATURES.map((f) => (
            <div key={f.text} className="campus-feature-pill">
              <span>{f.icon}</span><span>{f.text}</span>
            </div>
          ))}
        </div>
        <div className="campus-dept-tags">
          {["CSE", "Electronics", "Physics", "Mechanical", "Chemistry", "Civil"].map((d) => (
            <span key={d} className="dept-tag">{d}</span>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="login-panel">
        <div className="auth-blob auth-blob-purple" />
        <div className="auth-blob auth-blob-blue" />
        <div className="login-card">
          {/* Brand Header */}
          <div className="login-logo">
            <div className="login-logo-icon"><FontAwesomeIcon icon={faShield} /></div>
            <h1>Gate<span>Keeper</span>X</h1>
          </div>

          {/* Mode Toggle Tabs */}
          <div style={{
            display: "flex", background: "var(--bg-secondary)", borderRadius: 10,
            padding: 4, marginBottom: 20, gap: 4,
          }}>
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  transition: "all 0.2s",
                  background: mode === m ? "var(--brand-600)" : "transparent",
                  color: mode === m ? "white" : "var(--text-muted)",
                  boxShadow: mode === m ? "0 2px 8px rgba(59,130,246,0.3)" : "none",
                }}
                id={`tab-${m}`}
              >
                {m === "login" ? "🔑 Sign In" : "✨ Sign Up"}
              </button>
            ))}
          </div>

          {/* ── LOGIN FORM ── */}
          {mode === "login" && (
            <>
              <p className="login-subtitle">Sign in to access your campus resources</p>

              {authError && (
                <div className="error-message" id="login-error">
                  <FontAwesomeIcon icon={faTriangleExclamation} /> {authError}
                </div>
              )}

              <form onSubmit={handleLogin} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Institutional Email</label>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input id="email" name="email" type="email" required
                      placeholder="you@college.edu"
                      className={`form-input ${authError ? "error" : ""}`}
                      value={form.email} onChange={handleChange} autoComplete="email" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input id="password" name="password" type="password" required
                      placeholder="••••••••"
                      className={`form-input ${authError ? "error" : ""}`}
                      value={form.password} onChange={handleChange} autoComplete="current-password" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="role">
                    <FontAwesomeIcon icon={faUserTag} style={{ marginRight: 6 }} />Academic Role
                  </label>
                  <select id="role" name="role" className="form-input" value={form.role} onChange={handleChange}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} id="login-submit-btn">
                  {loading ? (
                    <><FontAwesomeIcon icon={faSpinner} spin /> Signing In…</>
                  ) : (
                    <>Access Campus System <FontAwesomeIcon icon={faArrowRight} /></>
                  )}
                </button>
              </form>

              <div className="login-demo">
                <p>📋 Demo Credentials — Click to autofill</p>
                <div className="login-demo-creds">
                  {demoCreds.map((c) => (
                    <button key={`${c.role}-${c.email}`} type="button" onClick={() => fillDemo(c)}
                      style={{
                        background: "none", border: "none", textAlign: "left",
                        cursor: "pointer", padding: "3px 0", fontSize: 12,
                        color: "var(--brand-700)", fontFamily: "monospace", fontWeight: 600,
                      }}
                      id={`demo-${c.role.replace(" ", "-").toLowerCase()}`}
                    >
                      [{c.role}] {c.email} / {c.password}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── SIGNUP FORM ── */}
          {mode === "signup" && (
            <>
              <p className="login-subtitle">Create your campus account</p>

              {signupSuccess && (
                <div style={{
                  background: "#dcfce7", border: "1px solid #86efac", borderRadius: 10,
                  padding: "12px 16px", marginBottom: 16, display: "flex",
                  alignItems: "center", gap: 10, color: "#166534", fontWeight: 600, fontSize: 14,
                }}>
                  <FontAwesomeIcon icon={faCheckCircle} /> Account created! Signing you in…
                </div>
              )}

              {signupError && (
                <div className="error-message">
                  <FontAwesomeIcon icon={faTriangleExclamation} /> {signupError}
                </div>
              )}

              <form onSubmit={handleSignup} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-name">Full Name</label>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faUser} className="input-icon" />
                    <input id="signup-name" name="name" type="text" required
                      placeholder="Your full name"
                      className="form-input"
                      value={signupForm.name} onChange={handleSignupChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-email">Institutional Email</label>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faEnvelope} className="input-icon" />
                    <input id="signup-email" name="email" type="email" required
                      placeholder="you@college.edu"
                      className="form-input"
                      value={signupForm.email} onChange={handleSignupChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-password">Password</label>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input id="signup-password" name="password" type="password" required
                      placeholder="Choose a password"
                      className="form-input"
                      value={signupForm.password} onChange={handleSignupChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
                  <div className="input-icon-wrapper">
                    <FontAwesomeIcon icon={faLock} className="input-icon" />
                    <input id="signup-confirm" name="confirmPassword" type="password" required
                      placeholder="Repeat your password"
                      className={`form-input ${signupError === "Passwords do not match" ? "error" : ""}`}
                      value={signupForm.confirmPassword} onChange={handleSignupChange} />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label" htmlFor="signup-role">
                      <FontAwesomeIcon icon={faUserTag} style={{ marginRight: 6 }} />Role
                    </label>
                    <select id="signup-role" name="role" className="form-input"
                      value={signupForm.role} onChange={handleSignupChange}>
                      {SIGNUP_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label" htmlFor="signup-dept">
                      <FontAwesomeIcon icon={faBuilding} style={{ marginRight: 6 }} />Department
                    </label>
                    <select id="signup-dept" name="departmentId" className="form-input"
                      value={signupForm.departmentId} onChange={handleSignupChange}>
                      <option value="">Select…</option>
                      {departments.map((d) => (
                        <option key={d.department_id} value={d.department_id}>
                          {d.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary"
                  disabled={loading || signupSuccess}
                  id="signup-submit-btn"
                  style={{ marginTop: 20 }}
                >
                  {loading ? (
                    <><FontAwesomeIcon icon={faSpinner} spin /> Creating Account…</>
                  ) : (
                    <>Create Account <FontAwesomeIcon icon={faArrowRight} /></>
                  )}
                </button>
              </form>

              <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <button onClick={() => switchMode("login")}
                  style={{
                    background: "none", border: "none", color: "var(--brand-600)",
                    fontWeight: 700, cursor: "pointer", fontSize: 13
                  }}>
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
