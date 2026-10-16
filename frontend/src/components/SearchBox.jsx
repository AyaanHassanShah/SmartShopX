import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Icon from "./Icon";
import useDebounce from "../hooks/useDebounce";
import { imgSrc, money } from "../utils/format";

export default function SearchBox({ autoFocus = false, onDone }) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef(null);
  const dq = useDebounce(q, 250);

  useEffect(() => {
    if (dq.trim().length < 2) { setItems([]); return; }
    let live = true;
    API.get("/products/search", { params: { q: dq.trim() } })
      .then(({ data }) => { if (live) { setItems(data); setOpen(true); setActive(-1); } })
      .catch(() => {});
    return () => { live = false; };
  }, [dq]);

  useEffect(() => {
    const close = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const go = (path) => { setOpen(false); setQ(""); onDone?.(); navigate(path); };

  const submit = (e) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(`/product/${items[active]._id}`);
    if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const onKey = (e) => {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % items.length); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <form className="searchbox" ref={box} onSubmit={submit} role="search">
      <Icon name="search" size={18} className="s-ico" />
      <input
        className="s-input" type="search" placeholder="Search products..." value={q} autoFocus={autoFocus}
        onChange={(e) => setQ(e.target.value)} onFocus={() => items.length && setOpen(true)} onKeyDown={onKey}
        aria-label="Search products" aria-autocomplete="list" aria-expanded={open}
      />
      {open && items.length > 0 && (
        <ul className="s-list" role="listbox">
          {items.map((p, i) => (
            <li key={p._id} role="option" aria-selected={i === active}>
              <button type="button" className={`s-item${i === active ? " active" : ""}`} onMouseEnter={() => setActive(i)} onClick={() => go(`/product/${p._id}`)}>
                <img src={imgSrc(p.image)} alt="" />
                <span className="s-meta"><b>{p.name}</b><small>{p.category}</small></span>
                <span className="money s-price">{money(p.price)}</span>
              </button>
            </li>
          ))}
          <li><button type="button" className="s-all" onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}>See all results for "{q.trim()}" <Icon name="arrowRight" size={14} /></button></li>
        </ul>
      )}
    </form>
  );
}
