import { useEffect, useState } from "react";
import Icon from "./Icon";
import { colorHex } from "../utils/format";

// Fully controlled by URL params (see Shop.jsx). Every control writes through onChange(patch).
export default function FilterSidebar({ facets, params, onChange, onClear, activeCount, open, onClose }) {
  const [min, setMin] = useState(params.minPrice);
  const [max, setMax] = useState(params.maxPrice);

  // keep local price inputs in sync when URL changes (e.g. "Clear all")
  useEffect(() => { setMin(params.minPrice); setMax(params.maxPrice); }, [params.minPrice, params.maxPrice]);

  // debounce price -> URL
  useEffect(() => {
    if (min === params.minPrice && max === params.maxPrice) return;
    const t = setTimeout(() => {
      let a = min === "" ? "" : Math.max(0, Number(min));
      let b = max === "" ? "" : Math.max(0, Number(max));
      if (a !== "" && b !== "" && a > b) [a, b] = [b, a];
      onChange({ minPrice: a === "" ? "" : String(a), maxPrice: b === "" ? "" : String(b) });
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max]);

  const toggle = (key, value) => {
    const list = params[key] ? params[key].split(",") : [];
    const next = list.includes(String(value)) ? list.filter((v) => v !== String(value)) : [...list, String(value)];
    onChange({ [key]: next.join(",") });
  };
  const has = (key, value) => (params[key] ? params[key].split(",").includes(String(value)) : false);

  if (!facets) {
    return (
      <aside className={`filters${open ? " open" : ""}`}>
        {[1, 2, 3].map((n) => <div key={n} className="skeleton" style={{ height: 120, marginBottom: 16 }} />)}
      </aside>
    );
  }

  return (
    <>
      <div className={`filters-scrim${open ? " open" : ""}`} onClick={onClose} />
      <aside className={`filters${open ? " open" : ""}`} aria-label="Product filters">
        <div className="filters-head">
          <h2>Filters {activeCount > 0 && <span className="badge badge-primary plain">{activeCount}</span>}</h2>
          <button className="btn-icon filters-close" onClick={onClose} aria-label="Close filters"><Icon name="x" /></button>
        </div>

        <details className="fgroup" open>
          <summary>Category</summary>
          <div className="flist">
            <label className="radio"><input type="radio" name="cat" checked={!params.category} onChange={() => onChange({ category: "" })} /> All categories</label>
            {facets.categories.map((c) => (
              <label key={c} className="radio">
                <input type="radio" name="cat" checked={params.category.toLowerCase() === c.toLowerCase()} onChange={() => onChange({ category: c })} /> {c}
              </label>
            ))}
          </div>
        </details>

        <details className="fgroup" open>
          <summary>Price (USD)</summary>
          <div className="price-row">
            <input className="input" type="number" min="0" inputMode="numeric" placeholder={`Min ${facets.price.min}`} value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" />
            <span>to</span>
            <input className="input" type="number" min="0" inputMode="numeric" placeholder={`Max ${facets.price.max}`} value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" />
          </div>
        </details>

        {facets.colors.length > 0 && (
          <details className="fgroup" open>
            <summary>Colour</summary>
            <div className="color-grid">
              {facets.colors.map((c) => (
                <button key={c} type="button" className={`color-opt${has("color", c) ? " on" : ""}`} onClick={() => toggle("color", c)} aria-pressed={has("color", c)}>
                  <i style={{ background: colorHex(c) }} />{c}
                </button>
              ))}
            </div>
          </details>
        )}

        {facets.sizes.length > 0 && (
          <details className="fgroup" open>
            <summary>Size</summary>
            <div className="size-grid">
              {facets.sizes.map((s) => (
                <button key={s} type="button" className={`size-opt${has("size", s) ? " on" : ""}`} onClick={() => toggle("size", s)} aria-pressed={has("size", s)}>{s}</button>
              ))}
            </div>
          </details>
        )}

        <details className="fgroup" open>
          <summary>Availability</summary>
          <label className="checkbox" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={params.inStock === "true"} onChange={(e) => onChange({ inStock: e.target.checked ? "true" : "" })} /> In stock only
          </label>
        </details>

        <div className="filters-foot">
          <button className="btn btn-outline btn-block" onClick={onClear} disabled={!activeCount}>Clear all filters</button>
          <button className="btn btn-primary btn-block filters-apply" onClick={onClose}>Show results</button>
        </div>
      </aside>
    </>
  );
}
