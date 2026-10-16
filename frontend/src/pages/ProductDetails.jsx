import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/EmptyState";
import SizeGuide from "../components/SizeGuide";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { colorHex, imgSrc, money, FREE_SHIPPING } from "../utils/format";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthed } = useAuth();
  const { add, lines } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [state, setState] = useState("loading"); // loading | ready | missing | error
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [showErr, setShowErr] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useDocumentTitle(product?.name);

  useEffect(() => {
    let live = true;
    setState("loading"); setQty(1); setShowErr(false);
    setShowSizeGuide(false);
    API.get(`/products/${id}`)
      .then(({ data }) => {
        if (!live) return;
        setProduct(data);
        // Only real options. No more invented fallback colours/sizes.
        setColor(data.colors?.length === 1 ? data.colors[0] : "");
        setSize(data.sizes?.length === 1 ? String(data.sizes[0]) : "");
        setState("ready");
        API.get("/products", { params: { category: data.category, limit: 5, inStock: "true" } })
          .then(({ data: r }) => live && setRelated(r.products.filter((p) => p._id !== data._id).slice(0, 4)))
          .catch(() => {});
      })
      .catch((e) => live && setState(e.response?.status === 404 ? "missing" : "error"));
    return () => { live = false; };
  }, [id]);

  if (state === "loading") {
    return (
      <Layout>
        <div className="pdp">
          <div className="skeleton" style={{ aspectRatio: "1/1", borderRadius: 18 }} />
          <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
            <div className="skeleton" style={{ height: 14, width: 120 }} />
            <div className="skeleton" style={{ height: 40, width: "80%" }} />
            <div className="skeleton" style={{ height: 28, width: 100 }} />
            <div className="skeleton" style={{ height: 90 }} />
            <div className="skeleton" style={{ height: 52 }} />
          </div>
        </div>
      </Layout>
    );
  }
  if (state !== "ready") {
    return (
      <Layout>
        <EmptyState icon="search" title={state === "missing" ? "Product not found" : "Couldn't load this product"} text={state === "missing" ? "It may have been removed or the link is incorrect." : "Please check your connection and try again."}>
          <Link to="/shop" className="btn btn-primary">Back to shop</Link>
        </EmptyState>
      </Layout>
    );
  }

  const needsColor = product.colors?.length > 0;
  const needsSize = product.sizes?.length > 0;
  const inBag = lines.filter((l) => l.product._id === product._id).reduce((n, l) => n + l.quantity, 0);
  const remaining = Math.max(product.countInStock - inBag, 0);
  const out = product.countInStock < 1;
  const maxQty = Math.max(remaining, 1);

  const addToBag = async (goCheckout = false) => {
    if ((needsColor && !color) || (needsSize && !size)) { setShowErr(true); return; }
    if (!isAuthed) { navigate("/login", { state: { from: location.pathname } }); return; }
    setAdding(true);
    const r = await add({ productId: product._id, quantity: qty, selectedColor: color || undefined, selectedSize: size === "" ? undefined : size });
    setAdding(false);
    if (!r.ok) { toast.error(r.message); return; }
    toast.success(`${product.name} added to your bag`);
    setQty(1);
    if (goCheckout) navigate("/cart");
  };

  return (
    <Layout>
      <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: 20 }}>
        <Link to="/">Home</Link><span>/</span>
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link><span>/</span>
        <span className="cur">{product.name}</span>
      </nav>

      <div className="pdp fade-in">
        <div className="pdp-media">
          <img src={imgSrc(product.image)} alt={product.name} />
          {out && <span className="tag tag-dark">Sold out</span>}
        </div>

        <div className="pdp-info">
          <span className="badge badge-primary plain">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="pdp-price money">{money(product.price)}</p>
          <p className="muted pdp-desc">{product.description}</p>

          {needsColor && (
            <div className="opt">
              <div className="opt-head"><b>Colour</b><span className="muted">{color || "Select a colour"}</span></div>
              <div className="opt-colors" role="radiogroup" aria-label="Colour">
                {product.colors.map((c) => (
                  <button key={c} role="radio" aria-checked={color === c} className={`swatch${color === c ? " on" : ""}`} onClick={() => setColor(c)} title={c}>
                    <i style={{ background: colorHex(c) }} /><span>{c}</span>
                  </button>
                ))}
              </div>
              {showErr && !color && <p className="field-error">Please choose a colour</p>}
            </div>
          )}

          {needsSize && (
            <div className="opt">
              <div className="opt-head">
                <b>{product.category?.toLowerCase().includes("shoe") ? "Shoe size" : "Size"}</b>
                <button type="button" className="guide-link" onClick={() => setShowSizeGuide(true)}><Icon name="ruler" size={14} /> Size guide</button>
              </div>
              <div className="size-grid" role="radiogroup" aria-label="Size">
                {product.sizes.map((s) => (
                  <button key={s} role="radio" aria-checked={size === String(s)} className={`size-opt${size === String(s) ? " on" : ""}`} onClick={() => setSize(String(s))}>{s}</button>
                ))}
              </div>
              {showErr && size === "" && <p className="field-error">Please choose a size</p>}
            </div>
          )}

          <div className="stock-line">
            {out ? <span className="badge badge-danger">Out of stock</span>
              : product.countInStock <= 5 ? <span className="badge badge-warn">Only {product.countInStock} left</span>
              : <span className="badge badge-success">In stock</span>}
            {inBag > 0 && <small className="muted">{inBag} already in your bag</small>}
          </div>

          {!out && (
            <div className="buy-row">
              <div className="qty" aria-label="Quantity">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} aria-label="Decrease quantity"><Icon name="minus" size={16} /></button>
                <span aria-live="polite">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(maxQty, q + 1))} disabled={qty >= maxQty} aria-label="Increase quantity"><Icon name="plus" size={16} /></button>
              </div>
              <button className="btn btn-primary btn-lg grow" onClick={() => addToBag(false)} disabled={adding || remaining < 1}>
                {adding ? <span className="spinner" /> : <Icon name="cart" size={18} />} {remaining < 1 ? "Max in bag" : "Add to bag"}
              </button>
            </div>
          )}
          {out && <button className="btn btn-lg btn-block" disabled>Sold out</button>}
          {!isAuthed && !out && <p className="field-hint">You'll be asked to sign in before adding to your bag.</p>}

          <ul className="perks">
            <li><Icon name="truck" size={20} /><div><b>Free delivery</b><small>On orders over ${FREE_SHIPPING}</small></div></li>
            <li><Icon name="refresh" size={20} /><div><b>Free 30-day returns</b><small>Changed your mind? Send it back.</small></div></li>
            <li><Icon name="shield" size={20} /><div><b>Secure checkout</b><small>Your details stay protected.</small></div></li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="block">
          <div className="block-head"><h2>You may also like</h2></div>
          <div className="pgrid pgrid-4">{related.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        </section>
      )}
      {showSizeGuide && <SizeGuide category={product.category} onClose={() => setShowSizeGuide(false)} />}
    </Layout>
  );
}
