import { useState, useEffect } from "react";
import {
  NavLink,
  Route,
  Routes,
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Users,
  CalendarClock,
  ArrowUpRight,
  Moon,
  Sun,
  LayoutGrid,
  LogOut,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import CompanyDetails from "./pages/CompanyDetails";
import Auth from "./pages/Auth";
import api, { errorMessage } from "./services/api";
import { Notice } from "./components/UI";
const navigation = [
  ["/", "Dashboard", LayoutDashboard],
  ["/companies", "Companies", Building2],
  ["/company-cards", "Company Cards", LayoutGrid],
  ["/applications", "Applications", BriefcaseBusiness],
  ["/contacts", "Contacts", Users],
  ["/follow-ups", "Follow Ups", CalendarClock],
];
export default function App() {
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [authError, setAuthError] = useState(""),
    [logoutBusy, setLogoutBusy] = useState(false);
  const location = useLocation(),
    navigate = useNavigate();
  async function checkSession() {
    setChecking(true);
    setAuthError("");
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      if (error.response?.status === 401) setUser(null);
      else setAuthError(errorMessage(error));
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    checkSession();
    const expired = () => setUser(null);
    window.addEventListener("session-expired", expired);
    return () => window.removeEventListener("session-expired", expired);
  }, []);
  async function logout() {
    setLogoutBusy(true);
    setAuthError("");
    try {
      await api.post("/auth/logout");
      setUser(null);
      navigate("/login", { replace: true });
    } catch (error) {
      setAuthError(errorMessage(error));
    } finally {
      setLogoutBusy(false);
    }
  }

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("internship-theme") || "dark";
    } catch {
      return "dark";
    }
  });
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("internship-theme", theme);
    } catch {
      /* Storage may be disabled. */
    }
  }, [theme]);
  const themeButton = (
    <button
      className="button secondary theme-toggle"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to night mode"
      }
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      {theme === "dark" ? "Light mode" : "Night mode"}
    </button>
  );
  if (checking)
    return <div className="auth-loading">Opening your workspace…</div>;
  if (authError && !user)
    return (
      <div className="auth-loading">
        <Notice error={authError} />
        <button className="button" onClick={checkSession}>
          Try again
        </button>
      </div>
    );
  if (!user)
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <Auth
              key="login"
              onAuthenticated={setUser}
              themeButton={themeButton}
            />
          }
        />
        <Route
          path="/signup"
          element={
            <Auth
              key="signup"
              signup
              onAuthenticated={setUser}
              themeButton={themeButton}
            />
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
              state={{ from: location.pathname + location.search }}
            />
          }
        />
      </Routes>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-icon">
            <BriefcaseBusiness size={23} />
          </span>
          <span>
            Internship<span className="brand-light">Tracker</span>
          </span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav>
          {navigation.map(([path, label, Icon]) => (
            <NavLink key={path} to={path} end={path === "/"}>
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-tip">
          <span>✦</span>
          <h3>Small steps. Big futures.</h3>
          <p>A thoughtful follow up can open a new door.</p>
          <Link to="/follow-ups">
            Plan your next step <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="sidebar-footer">
          <span className="profile-avatar">
            {user.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            {user.name}
            <small>{user.email}</small>
          </div>
          <span className="online-dot" />
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            My workspace <span className="slash">/</span>{" "}
            <strong>Internship Tracker</strong>
          </span>
          <div className="topbar-actions">
            {themeButton}
            <button
              className="button secondary theme-toggle"
              onClick={logout}
              disabled={logoutBusy}
            >
              <LogOut size={15} />
              {logoutBusy ? "Logging out…" : "Log out"}
            </button>
            <span className="topbar-date">
              {new Date().toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </header>
        <main key={user.id}>
          <Notice error={authError} />
          <Routes>
            <Route
              path="/login"
              element={<Navigate to={location.state?.from || "/"} replace />}
            />
            <Route
              path="/signup"
              element={<Navigate to={location.state?.from || "/"} replace />}
            />
            <Route
              path="/company-cards"
              element={
                <Records key="company-cards" type="companies" view="cards" />
              }
            />
            <Route path="/" element={<Dashboard />} />
            {["companies", "applications", "contacts", "follow-ups"].map(
              (type) => (
                <Route
                  key={type}
                  path={"/" + type}
                  element={<Records key={type} type={type} />}
                />
              ),
            )}
            <Route path="/companies/:id" element={<CompanyDetails />} />
            <Route
              path="*"
              element={
                <div>
                  <h1>Page not found</h1>
                  <Link to="/">Go to dashboard</Link>
                </div>
              }
            />
          </Routes>
        </main>
        <footer className="workspace-footer">
          A clearer path to your next opportunity.
        </footer>
      </div>
    </div>
  );
}
