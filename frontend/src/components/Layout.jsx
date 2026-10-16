import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Icon from "./Icon";
import SearchBox from "./SearchBox";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import useFacets from "../hooks/useFacets";
import { FREE_SHIPPING } from "../utils/format";

const Brand = ({ light }) => (
  <Link to="/" className={`brand${light ? " light" : ""}`} aria-label="Smart Shop X home">
    <span className="brand-mark"><Icon name="store" size={18} stroke={2.2} /></span>
    <span>Smart Shop <b>X</b></span>
  </Link>
);

export default function Layout({ children, wide = false }) {
  const { user, isAuthed, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const facets = useFacets();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => { setDrawer(false); setMenu(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { document.body.style.overflow = drawer ? "hidden" : ""; }, [drawer]);

  const signOut = () => { logout(); navigate("/"); };
  const cats = (facets?.categories || []).slice(0, 6);

  return (
    <div className="app">
      <a href="#main" className="skip">Skip to content</a>
      <div className="promo">Free shipping on orders over ${FREE_SHIPPING} &nbsp;|&nbsp; 30-day free returns</div>

      <header className="header">
        <div className="container header-row">
          <button className="btn-icon burger" onClick={() => setDrawer(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <Brand />

          <nav className="nav" aria-label="Main">
            <NavLink to="/shop" end className={() => `nav-link${pathname === "/shop" && !new URLSearchParams(search).get("category") ? " active" : ""}`}>All Products</NavLink>
            {cats.map((c) => (
              <NavLink key={c} to={`/shop?category=${encodeURIComponent(c)}`} className={() => `nav-link${pathname === "/shop" && new URLSearchParams(search).get("category") === c ? " active" : ""}`}>{c}</NavLink>
            ))}
          </nav>

          <div className="header-search"><SearchBox /></div>

          <div className="header-actions">
            <Link to="/cart" className="btn-icon" aria-label={`Bag, ${count} items`}>
              <Icon name="cart" />
              {count > 0 && <span className="cart-badge">{count > 99 ? "99+" : count}</span>}
            </Link>

            {isAuthed ? (
              <div className="user-menu">
                <button className="avatar" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu} aria-label="Account menu">
                  {(user?.name || "?").charAt(0).toUpperCase()}
                </button>
                {menu && (
                  <>
                    <div className="menu-scrim" onClick={() => setMenu(false)} />
                    <div className="menu" role="menu">
                      <div className="menu-head"><b>{user?.name}</b><small>{user?.email}</small></div>
                      <Link to="/orders" role="menuitem"><Icon name="box" size={16} /> My orders</Link>
                      <Link to="/cart" role="menuitem"><Icon name="cart" size={16} /> My bag</Link>
                      {isAdmin && <Link to="/admin" role="menuitem"><Icon name="grid" size={16} /> Admin dashboard</Link>}
                      <button onClick={signOut} role="menuitem" className="danger"><Icon name="logout" size={16} /> Sign out</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-dark btn-sm signin">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`drawer-scrim${drawer ? " open" : ""}`} onClick={() => setDrawer(false)} />
      <aside className={`drawer${drawer ? " open" : ""}`} aria-hidden={!drawer}>
        <div className="drawer-head"><Brand /><button className="btn-icon" onClick={() => setDrawer(false)} aria-label="Close menu"><Icon name="x" /></button></div>
        <div className="drawer-search"><SearchBox onDone={() => setDrawer(false)} /></div>
        <nav className="drawer-nav">
          <Link to="/shop">All Products</Link>
          {cats.map((c) => <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`}>{c}</Link>)}
          <hr className="divider" />
          {isAuthed ? (
            <>
              <Link to="/orders">My orders</Link>
              <Link to="/cart">My bag {count > 0 && <span className="badge badge-primary plain">{count}</span>}</Link>
              {isAdmin && <Link to="/admin">Admin dashboard</Link>}
              <button onClick={signOut}>Sign out</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-block">Sign in / Create account</Link>
          )}
        </nav>
      </aside>

      <main id="main" className="main">
        <div className={wide ? "container" : "container"}>{children}</div>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-about">
              <Brand light />
              <p>Footwear, apparel and sports gear from brands you trust. Fast delivery, honest prices, easy returns.</p>
            </div>
            <div>
              <h4>Shop</h4>
              <Link to="/shop">All products</Link>
              <Link to="/shop?sort=newest">New arrivals</Link>
              <Link to="/shop?inStock=true">In stock now</Link>
            </div>
            <div>
              <h4>Account</h4>
              <Link to="/orders">Order status</Link>
              <Link to="/cart">My bag</Link>
              <Link to="/login">Sign in</Link>
            </div>
            <div>
              <h4>Help</h4>
              <span>Free delivery over ${FREE_SHIPPING}</span>
              <span>30-day returns</span>
              <span>Secure checkout</span>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} Smart Shop X. All rights reserved.</span>
            <span>Built with React, Express and MongoDB</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
