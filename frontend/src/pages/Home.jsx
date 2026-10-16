import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import Layout from "../components/Layout";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import Icon from "../components/Icon";
import useFacets from "../hooks/useFacets";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { FREE_SHIPPING, imgSrc, money } from "../utils/format";

export default function Home() {
  useDocumentTitle("");
  const facets = useFacets();
  const [latest, setLatest] = useState(null);
  const [byCat, setByCat] = useState({});

  useEffect(() => {
    API.get("/products", { params: { sort: "newest", limit: 8, inStock: "true" } })
      .then(({ data }) => setLatest(Array.isArray(data?.products) ? data.products : []))
      .catch(() => setLatest([]));
  }, []);

  // one small row per category (first 4 categories)
  useEffect(() => {
    if (!facets) return;
    facets.categories.slice(0, 3).forEach((c) =>
      API.get("/products", { params: { category: c, limit: 4, inStock: "true" } })
        .then(({ data }) => {
          if (Array.isArray(data?.products)) setByCat((s) => ({ ...s, [c]: data.products }));
        })
        .catch(() => {})
    );
  }, [facets]);

  return (
    <Layout>
      <section className="storefront-hero ecommerce-hero fade-in">
        <div className="storefront-copy">
          <span className="storefront-label">Smart Shop X / New season</span>
          <h1>Your next<br /><span>favourite find.</span></h1>
          <p>Shop the latest footwear, apparel and everyday essentials — all in one place.</p>
          <div className="hero-cta">
            <Link to="/shop?sort=newest" className="hero-btn">Shop new arrivals <Icon name="arrowRight" size={18} /></Link>
            <Link to="/shop" className="hero-btn">Browse all products <Icon name="arrowRight" size={18} /></Link>
          </div>
          <div className="hero-service-points">
            <span><Icon name="truck" size={16} /> Free delivery over ${FREE_SHIPPING}</span>
            <span><Icon name="refresh" size={16} /> Easy returns</span>
          </div>
        </div>
        <div className="storefront-collage">
          <div className="shop-window-top"><span>Shop the drop</span></div>

          {/* ── Auto-Sliding Carousel ── */}
          <ShopWindowCarousel products={(latest || []).slice(0, 6)} />

          <Link to="/shop?sort=newest" className="shop-window-footer">View all new arrivals <Icon name="arrowRight" size={16} /></Link>
          <span className="shop-window-sticker">JUST<br />LANDED</span>
        </div>
      </section>

      <section className="offer-bar">
        <span className="offer-star">✳</span><b>FREE SHIPPING</b><span>On orders over ${FREE_SHIPPING}</span><i>•</i><b>30-DAY RETURNS</b><span>Shop with confidence</span><span className="offer-star">✳</span>
      </section>

      {facets && facets.categories.length > 0 && (
        <section className="category-nav">
          <span>Browse the store</span>
          <div>{facets.categories.map((c) => <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`}>{c}<Icon name="arrowRight" size={14} /></Link>)}</div>
        </section>
      )}

      <section className="home-v2-section">
        <div className="home-v2-heading"><div><span className="eyebrow">Just in</span><h2>New arrivals</h2></div><Link to="/shop?sort=newest" className="outline-link">View all <Icon name="arrowRight" size={15} /></Link></div>
        <div className="editorial-products">
          {latest === null ? Array.from({ length: 4 }, (_, i) => <ProductCardSkeleton key={i} />) : latest.slice(0, 4).map((p, index) => (
            <div key={p._id} className={`editorial-product editorial-product-${index}`}><ProductCard p={p} /></div>
          ))}
        </div>
      </section>

      <section className="feature-split">
        <div className="feature-panel feature-panel-dark">
          <span className="eyebrow">Built for daily miles</span>
          <h2>Go further<br />in comfort.</h2>
          <Link to="/shop?category=Shoes" className="panel-link">Shop footwear <Icon name="arrowRight" size={15} /></Link>
        </div>
        <div className="feature-panel feature-panel-image">
          {latest?.[1] && <img src={imgSrc(latest[1].image)} alt={latest[1].name} />}
          <div><span className="eyebrow">The weekly rotation</span><h2>Pieces you’ll<br />reach for.</h2><Link to="/shop" className="panel-link">Shop apparel <Icon name="arrowRight" size={15} /></Link></div>
        </div>
      </section>

      {Object.entries(byCat).map(([cat, items]) => items?.length > 0 && (
        <section key={cat} className="home-v2-section category-row">
          <div className="home-v2-heading"><div><span className="eyebrow">Curated collection</span><h2>{cat}</h2></div><Link to={`/shop?category=${encodeURIComponent(cat)}`} className="outline-link">Shop {cat} <Icon name="arrowRight" size={15} /></Link></div>
          <div className="pgrid pgrid-4">{items.map((p) => <ProductCard key={p._id} p={p} />)}</div>
        </section>
      ))}

      <section className="member-banner">
        <div><span className="eyebrow">Your bag, made better</span><h2>Save your favourites.<br />Checkout faster.</h2></div>
        <Link to="/login" className="btn btn-light btn-lg">Create an account <Icon name="arrowRight" size={17} /></Link>
      </section>
    </Layout>
  );
}

/* ─────────────────────────────────────────────
   Shop-Window Carousel
───────────────────────────────────────────── */
function ShopWindowCarousel({ products }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);
  const total = products.length;

  const goTo = useCallback((idx) => {
    setActive((idx + total) % total);
  }, [total]);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % total), 2000);
  }, [total]);

  useEffect(() => {
    if (total === 0) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  }, [startTimer, total]);

  if (total === 0) return <div className="swc-loading">Loading the latest drop...</div>;

  const p = products[active];

  return (
    <div
      className="swc-wrap"
      onMouseEnter={() => clearInterval(timerRef.current)}
      onMouseLeave={startTimer}
    >
      {/* Slide */}
      <Link key={active} to={`/product/${p._id}`} className="swc-card">
        <span className="swc-badge">New</span>
        <span className="swc-img">
          <img src={imgSrc(p.image)} alt={p.name} />
        </span>
        <span className="swc-details">
          <small>{p.category}</small>
          <b>{p.name}</b>
          <strong>{money(p.price)}</strong>
        </span>
      </Link>

      {/* Prev / Next */}
      <button className="swc-btn swc-prev" onClick={() => { goTo(active - 1); startTimer(); }} aria-label="Previous">
        <Icon name="chevLeft" size={18} />
      </button>
      <button className="swc-btn swc-next" onClick={() => { goTo(active + 1); startTimer(); }} aria-label="Next">
        <Icon name="chevRight" size={18} />
      </button>

      {/* Dots */}
      <div className="swc-dots">
        {products.map((_, i) => (
          <button
            key={i}
            className={`swc-dot${i === active ? ' active' : ''}`}
            onClick={() => { goTo(i); startTimer(); }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Slide counter */}
      <span className="swc-counter">{active + 1} / {total}</span>
    </div>
  );
}
