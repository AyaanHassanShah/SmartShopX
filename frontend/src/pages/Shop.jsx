import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import API, { errMsg } from "../services/api";
import Layout from "../components/Layout";
import FilterSidebar from "../components/FilterSidebar";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Icon from "../components/Icon";
import useFacets from "../hooks/useFacets";
import useDocumentTitle from "../hooks/useDocumentTitle";

const PAGE_SIZE = 12;
const SORTS = [
  { v: "newest", l: "Newest" },
  { v: "price-asc", l: "Price: low to high" },
  { v: "price-desc", l: "Price: high to low" },
  { v: "name-asc", l: "Name: A to Z" },
];
const KEYS = ["q", "category", "color", "size", "minPrice", "maxPrice", "inStock", "sort", "page"];

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const facets = useFacets();
  const [data, setData] = useState({ products: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const params = useMemo(() => {
    const o = {};
    KEYS.forEach((k) => (o[k] = sp.get(k) || ""));
    o.sort = o.sort || "newest";
    return o;
  }, [sp]);

  useDocumentTitle(params.category || (params.q ? `Search: ${params.q}` : "Shop"));

  // Single place that edits the URL. Any filter change resets to page 1.
  const update = useCallback((patch, keepPage = false) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => (v === "" || v == null ? next.delete(k) : next.set(k, v)));
    if (!keepPage && !("page" in patch)) next.delete("page");
    if (next.get("sort") === "newest") next.delete("sort");
    setSp(next, { replace: false });
  }, [sp, setSp]);

  const clearAll = () => setSp(new URLSearchParams());

  const fetchKey = sp.toString();
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    const query = { limit: PAGE_SIZE };
    KEYS.forEach((k) => params[k] && (query[k] = params[k]));
    if (query.q) { query.search = query.q; delete query.q; }

    API.get("/products", { params: query, signal: ctrl.signal })
      .then(({ data }) => {
        setData(data);
        // If the page number is beyond the last page after filtering, snap back
        if (data.page > data.pages) update({ page: String(data.pages) }, true);
      })
      .catch((e) => { if (e.code !== "ERR_CANCELED") setError(errMsg(e)); })
      .finally(() => { if (!ctrl.signal.aborted) setLoading(false); });
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchKey]);

  const chips = [];
  if (params.q) chips.push({ k: "q", label: `"${params.q}"`, clear: { q: "" } });
  if (params.category) chips.push({ k: "category", label: params.category, clear: { category: "" } });
  params.color && params.color.split(",").forEach((c) => chips.push({ k: "c" + c, label: c, clear: { color: params.color.split(",").filter((x) => x !== c).join(",") } }));
  params.size && params.size.split(",").forEach((s) => chips.push({ k: "s" + s, label: `Size ${s}`, clear: { size: params.size.split(",").filter((x) => x !== s).join(",") } }));
  if (params.minPrice || params.maxPrice) chips.push({ k: "p", label: `$${params.minPrice || 0} - ${params.maxPrice ? "$" + params.maxPrice : "any"}`, clear: { minPrice: "", maxPrice: "" } });
  if (params.inStock) chips.push({ k: "i", label: "In stock", clear: { inStock: "" } });

  const from = data.total ? (data.page - 1) * PAGE_SIZE + 1 : 0;
  const to = Math.min(data.page * PAGE_SIZE, data.total);

  return (
    <Layout>
      <div className="shop-head">
        <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span className="cur">{params.category || "All products"}</span></nav>
        <h1 className="page-title">{params.q ? `Results for "${params.q}"` : params.category || "All products"}</h1>
        <p className="page-sub" aria-live="polite">{loading ? "Loading..." : data.total ? `Showing ${from}-${to} of ${data.total} products` : "No products found"}</p>
      </div>

      <div className="shop-layout">
        <FilterSidebar facets={facets} params={params} onChange={update} onClear={clearAll} activeCount={chips.length} open={showFilters} onClose={() => setShowFilters(false)} />

        <section>
          <div className="toolbar">
            <button className="btn btn-outline btn-sm filter-toggle" onClick={() => setShowFilters(true)}>
              <Icon name="filter" size={16} /> Filters {chips.length > 0 && <span className="badge badge-primary plain">{chips.length}</span>}
            </button>
            <div className="chips">
              {chips.map((c) => (
                <span key={c.k} className="chip">{c.label}<button onClick={() => update(c.clear)} aria-label={`Remove ${c.label}`}><Icon name="x" size={12} /></button></span>
              ))}
              {chips.length > 1 && <button className="link-btn" onClick={clearAll}>Clear all</button>}
            </div>
            <label className="sort">
              <span className="sr-only">Sort by</span>
              <select className="select" value={params.sort} onChange={(e) => update({ sort: e.target.value })}>
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </label>
          </div>

          {error ? (
            <div className="alert alert-error" role="alert">{error} <button className="link-btn" onClick={() => update({})}>Retry</button></div>
          ) : loading ? (
            <div className="pgrid">{Array.from({ length: 6 }, (_, i) => <ProductCardSkeleton key={i} />)}</div>
          ) : data.products.length === 0 ? (
            <EmptyState icon="search" title="No matching products" text="Try removing a filter or searching for something else.">
              <button className="btn btn-primary" onClick={clearAll}>Clear all filters</button>
            </EmptyState>
          ) : (
            <>
              <div className="pgrid fade-in">{data.products.map((p) => <ProductCard key={p._id} p={p} />)}</div>
              <Pagination page={data.page} pages={data.pages} onChange={(n) => { update({ page: String(n) }, true); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
            </>
          )}
        </section>
      </div>
    </Layout>
  );
}
