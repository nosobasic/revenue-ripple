import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { supabase } from "../supabase/client";
import "../pages.css";

export default function AffiliateLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(email, password);
      console.log("response", response);
      // Check if user is an affiliate or reseller
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("email", email)
        .single();

      if (userError) throw userError;

      if (userData.role === "affiliate" || userData.role === "reseller") {
        navigate("/affiliate-centre");
      } else {
        setError(
          "This login is for affiliates and resellers only. Please use the regular login."
        );
        await signOut();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await resetPassword(email);
      alert("Check your email for password reset instructions");
      setShowForgotPassword(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Navbar />
      <div className="auth-box">
        <div className="auth-header">
          <h2 className="auth-title">
            {showForgotPassword
              ? "Reset your password"
              : "Affiliate & Reseller Login"}
          </h2>
          <p className="auth-subtitle">
            Not an affiliate yet?{" "}
            <Link to="/affiliate/sign-up" className="auth-link">
              Apply to become an affiliate
            </Link>
          </p>
        </div>

        {showForgotPassword ? (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="auth-link"
              >
                Back to login
              </button>
              <button type="submit" disabled={loading} className="auth-button">
                {loading ? "Sending..." : "Send reset instructions"}
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleLogin}>
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
              <label htmlFor="email-address">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="auth-link"
              >
                Forgot your password?
              </button>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}
      </div>
      <footer className="footer">
        <div className="container">
          <p>&copy; 2025 Revenue Ripple. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
