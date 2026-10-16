import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: "grid", end: true },
  { to: "/admin/products", label: "Products", icon: "tag" },
  { to: "/admin/orders", label: "Orders", icon: "box" },
];

export default function AdminLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { document.title = `${title} | Admin`; }, [title]);

  return (
    <div className="admin">
      <div className={`drawer-scrim${open ? " open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`admin-side${open ? " open" : ""}`}>
        <Link to="/" className="brand light"><span className="brand-mark"><Icon name="store" size={18} stroke={2.2} /></span><span>Smart Shop <b>X</b></span></Link>
        <span className="admin-tag">Admin console</span>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "on" : "")}><Icon name={n.icon} size={18} />{n.label}</NavLink>
          ))}
        </nav>
        <div className="admin-side-foot">
          <Link to="/"><Icon name="store" size={16} /> View storefront</Link>
          <button onClick={() => { logout(); navigate("/login"); }}><Icon name="logout" size={16} /> Sign out</button>
        </div>
      </aside>

      <div className="admin-body">
        <header className="admin-top">
          <button className="btn-icon admin-burger" onClick={() => setOpen(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <div className="grow"><h1>{title}</h1>{subtitle && <p className="muted">{subtitle}</p>}</div>
          {actions}
          <span className="avatar sm" title={user?.email}>{(user?.name || "A").charAt(0).toUpperCase()}</span>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
