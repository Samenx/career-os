import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BriefcaseBusiness,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import api, { errorMessage } from "../services/api";
import { Notice } from "../components/UI";
export default function Auth({ signup = false, onAuthenticated, themeButton }) {
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const location = useLocation();
  async function submit(event) {
    event.preventDefault();
    setError("");
    if (signup && password !== confirmation) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(signup ? "/auth/signup" : "/auth/login", {
        name,
        email,
        password,
      });
      onAuthenticated(data.user);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-shell">
      <header className="auth-header">
        <Link to="/login" className="brand">
          <span className="brand-icon">
            <BriefcaseBusiness size={23} />
          </span>
          Internship Tracker
        </Link>
        {themeButton}
      </header>
      <main className="auth-layout">
        <div className="auth-story">
          <span className="eyebrow">YOUR NEXT CHAPTER</span>
          <h1>
            Opportunities ahead.
            <br />A space to make them yours.
          </h1>
          <p>
            Keep every application, connection, and next step in one personal
            workspace.
          </p>
          <div className="auth-feature">
            <ShieldCheck size={22} />
            <span>Your companies and notes stay in your account.</span>
          </div>
          <div className="auth-story-cards" aria-hidden="true">
            <span>Discover companies</span>
            <span>Build connections</span>
            <span>Track your progress</span>
          </div>
        </div>
        <section className="panel auth-panel">
          <div className="eyebrow">
            {signup ? "GET STARTED" : "WELCOME BACK"}
          </div>
          <h2>{signup ? "Create your account" : "Log in to your workspace"}</h2>
          <p className="muted">
            {signup
              ? "A clearer path to your next opportunity."
              : "Your next steps are right where you left them."}
          </p>
          <Notice error={error} />
          <form onSubmit={submit}>
            {signup && (
              <label htmlFor="auth-name">
                Your name
                <input
                  id="auth-name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            )}
            <label htmlFor="auth-email">
              Email
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label htmlFor="auth-password">Password</label>
            <div className="password-input">
              <input
                id="auth-password"
                type={visible ? "text" : "password"}
                autoComplete={signup ? "new-password" : "current-password"}
                required
                minLength={8}
                maxLength={128}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="icon-button"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={() => setVisible((v) => !v)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {signup && (
              <>
                <small>
                  Use at least 8 characters. Spaces and password managers are
                  supported.
                </small>
                <label htmlFor="auth-confirm">
                  Confirm password
                  <input
                    id="auth-confirm"
                    type={visible ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    maxLength={128}
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                </label>
              </>
            )}
            <small className="remember-note">
              This browser remembers you for 90 days and renews your login while
              you use the app.
            </small>
            <button className="button auth-submit" disabled={busy}>
              {busy ? "Please wait…" : signup ? "Create account" : "Log in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <p className="auth-switch">
            {signup ? "Already have an account?" : "New here?"}{" "}
            <Link to={signup ? "/login" : "/signup"} state={location.state}>
              {signup ? "Log in" : "Sign up"}
            </Link>
          </p>
          {signup && (
            <p className="auth-setup-note">
              The first account on this installation keeps the existing company
              list. Additional accounts start with an empty workspace.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
