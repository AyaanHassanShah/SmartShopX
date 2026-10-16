import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import API, { errMsg } from "../services/api";
import Icon from "../components/Icon";
import { useAuth } from "../context/AuthContext";
import useDocumentTitle from "../hooks/useDocumentTitle";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function Login() {
  const { login, isAuthed, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [touched, setTouched] = useState({});
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";
  useDocumentTitle(isLogin ? "Sign in" : "Create account");

  if (isAuthed && !loading) return <Navigate to={from || (isAdmin ? "/admin" : "/")} replace />;

  const errors = {
    name: !isLogin && f.name.trim().length < 2 ? "Enter your full name" : "",
    email: !EMAIL_RX.test(f.email.trim()) ? "Enter a valid email address" : "",
    password: isLogin ? (!f.password ? "Enter your password" : "") : f.password.length < 8 ? "Use at least 8 characters" : "",
  };
  const valid = !errors.name && !errors.email && !errors.password;
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!valid) return;
    setLoading(true); setError("");
    try {
      const { data } = await API.post(isLogin ? "/auth/login" : "/auth/register", isLogin ? { email: f.email, password: f.password } : f);
      login(data);
      navigate(from || (data.isAdmin ? "/admin" : "/"), { replace: true });
    } catch (err) {
      setError(errMsg(err));
      setLoading(false);
    }
  };

  const field = (k, label, props) => (
    <div className="field">
      <label className="label" htmlFor={k}>{label}</label>
      <div className="input-wrap">
        <input id={k} className={`input${touched[k] && errors[k] ? " invalid" : ""}`} value={f[k]} onChange={set(k)} onBlur={blur(k)} aria-invalid={!!(touched[k] && errors[k])} {...props} />
        {k === "password" && (
          <button type="button" className="btn-icon icon-right" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}><Icon name={show ? "eyeOff" : "eye"} size={18} /></button>
        )}
      </div>
      {touched[k] && errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <div className="auth">
      <aside className="auth-side">
        <Link to="/" className="brand light"><span className="brand-mark"><Icon name="store" size={18} stroke={2.2} /></span><span>Smart Shop <b>X</b></span></Link>
        <div>
          <h2>Everything you need, delivered.</h2>
          <ul>
            <li><Icon name="truck" size={18} /> Free shipping over $150</li>
            <li><Icon name="refresh" size={18} /> Free 30-day returns</li>
            <li><Icon name="box" size={18} /> Track every order live</li>
          </ul>
        </div>
        <small>&copy; {new Date().getFullYear()} Smart Shop X</small>
      </aside>

      <main className="auth-main">
        <form className="auth-card fade-in" onSubmit={submit} noValidate>
          <Link to="/" className="back-link"><Icon name="chevLeft" size={16} /> Back to store</Link>
          <h1>{isLogin ? "Welcome back" : "Create your account"}</h1>
          <p className="muted">{isLogin ? "Sign in to see your bag and orders." : "It takes less than a minute."}</p>

          {from && isLogin && <div className="alert alert-info">Please sign in to continue.</div>}
          {error && <div className="alert alert-error" role="alert">{error}</div>}

          {!isLogin && field("name", "Full name", { placeholder: "Alex Johnson", autoComplete: "name" })}
          {field("email", "Email", { type: "email", placeholder: "you@example.com", autoComplete: "email" })}
          {field("password", "Password", { type: show ? "text" : "password", placeholder: isLogin ? "Your password" : "At least 8 characters", autoComplete: isLogin ? "current-password" : "new-password" })}

          <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Please wait...</> : isLogin ? "Sign in" : "Create account"}
          </button>

          <p className="switch">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <button type="button" className="link-btn" onClick={() => { setMode(isLogin ? "register" : "login"); setError(""); setTouched({}); }}>{isLogin ? "Create an account" : "Sign in"}</button>
          </p>
        </form>
      </main>
    </div>
  );
}
