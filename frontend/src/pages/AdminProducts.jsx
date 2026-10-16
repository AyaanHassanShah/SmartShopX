import { useCallback, useEffect, useState } from "react";
import API, { errMsg } from "../services/api";
import AdminLayout from "../components/AdminLayout";
import Icon from "../components/Icon";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import { useToast } from "../context/ToastContext";
import useDebounce from "../hooks/useDebounce";
import useFacets, { resetFacetsCache } from "../hooks/useFacets";
import { imgSrc, money } from "../utils/format";

const BLANK = { name: "", price: "", description: "", category: "", image: "", countInStock: "", colors: "", sizes: "" };
const LIMIT = 10;

export default function AdminProducts() {
  const toast = useToast();
  const facets = useFacets();
  const [data, setData] = useState({ products: [], total: 0, pages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounce(q, 350);

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/products", { params: { search: dq, category: cat, page, limit: LIMIT, sort: "newest" } });
      setData(data);
      if (data.page > data.pages) setPage(data.pages);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq, cat, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => setPage(1), [dq, cat]);

  const open = (p = null) => {
    setEditing(p); setErrors({});
    setForm(p ? { name: p.name, price: p.price, description: p.description, category: p.category, image: p.image, countInStock: p.countInStock, colors: (p.colors || []).join(", "), sizes: (p.sizes || []).join(", ") } : BLANK);
    setModal(true);
  };
  const close = () => !saving && setModal(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (form.price === "" || Number(form.price) < 0) e.price = "Enter a valid price";
    if (form.countInStock === "" || !Number.isInteger(Number(form.countInStock)) || Number(form.countInStock) < 0) e.countInStock = "Whole number, 0 or more";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.image.trim()) e.image = "Image URL or filename is required";
    if (form.sizes.trim() && form.sizes.split(",").some((s) => !s.trim())) e.sizes = "Enter sizes separated by commas";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), countInStock: Number(form.countInStock) };
      editing ? await API.put(`/products/${editing._id}`, payload) : await API.post("/products", payload);
      toast.success(editing ? "Product updated" : "Product created");
      resetFacetsCache();
      setModal(false);
      load();
    } catch (err) { toast.error(errMsg(err)); }
    finally { setSaving(false); }
  };

  const del = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    try {
      await API.delete(`/products/${p._id}`);
      toast.success("Product deleted");
      resetFacetsCache();
      load();
    } catch (err) { toast.error(errMsg(err)); }
  };

  const fld = (k, label, props = {}) => (
    <div className="field">
      <label className="label" htmlFor={`f-${k}`}>{label}</label>
      <input id={`f-${k}`} className={`input${errors[k] ? " invalid" : ""}`} value={form[k]} onChange={set(k)} {...props} />
      {errors[k] ? <span className="field-error">{errors[k]}</span> : props.hint && <span className="field-hint">{props.hint}</span>}
    </div>
  );

  return (
    <AdminLayout
      title="Products" subtitle={`${data.total} in catalogue`}
      actions={<button className="btn btn-primary" onClick={() => open()}><Icon name="plus" size={18} /> Add product</button>}
    >
      <div className="card">
        <div className="table-tools">
          <div className="input-wrap grow"><Icon name="search" size={18} className="icon-left" /><input className="input" placeholder="Search products..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" /></div>
          <select className="select" style={{ maxWidth: 200 }} value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {facets?.categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 20, display: "grid", gap: 10 }}>{Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}</div>
        ) : data.products.length === 0 ? (
          <EmptyState icon="tag" title="No products found" text="Try a different search or add a new product." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Options</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
              <tbody>
                {data.products.map((p) => (
                  <tr key={p._id}>
                    <td><div className="prod-cell"><img src={imgSrc(p.image)} alt="" /><b>{p.name}</b></div></td>
                    <td>{p.category}</td>
                    <td className="money">{money(p.price)}</td>
                    <td><span className={`badge ${p.countInStock === 0 ? "badge-danger" : p.countInStock <= 5 ? "badge-warn" : "badge-success"}`}>{p.countInStock === 0 ? "Out of stock" : p.countInStock}</span></td>
                    <td className="muted" style={{ fontSize: ".8rem" }}>{p.colors?.length || 0} colours, {p.sizes?.length || 0} sizes</td>
                    <td><div className="row-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => open(p)}><Icon name="edit" size={14} /> Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => del(p)} aria-label={`Delete ${p.name}`}><Icon name="trash" size={14} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />

      {modal && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <form className="modal" onSubmit={save} noValidate role="dialog" aria-modal="true" aria-label={editing ? "Edit product" : "Add product"}>
            <div className="modal-head"><h2>{editing ? "Edit product" : "Add product"}</h2><button type="button" className="btn-icon" onClick={close} aria-label="Close"><Icon name="x" /></button></div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="span-2">{fld("name", "Product name")}</div>
                <div className="field">
                  <label className="label" htmlFor="f-category">Category</label>
                  <input id="f-category" list="cats" className={`input${errors.category ? " invalid" : ""}`} value={form.category} onChange={set("category")} />
                  <datalist id="cats">{facets?.categories.map((c) => <option key={c} value={c} />)}</datalist>
                  {errors.category && <span className="field-error">{errors.category}</span>}
                </div>
                {fld("price", "Price (USD)", { type: "number", min: 0, step: "0.01" })}
                {fld("countInStock", "Stock", { type: "number", min: 0, step: 1 })}
                {fld("sizes", "Sizes", { placeholder: "XS, S, M, L, XL or 40, 41, 42", hint: "Use apparel sizes for clothes and numeric sizes for shoes. Leave blank for products without sizes." })}
                <div className="span-2">{fld("colors", "Colours", { placeholder: "Black, White, Red", hint: "Comma separated. These power the shop filters." })}</div>
                <div className="span-2 field">
                  <label className="label" htmlFor="f-desc">Description</label>
                  <textarea id="f-desc" className={`textarea${errors.description ? " invalid" : ""}`} value={form.description} onChange={set("description")} />
                  {errors.description && <span className="field-error">{errors.description}</span>}
                </div>
                <div className="span-2">{fld("image", "Image URL or uploaded filename", { placeholder: "https://... or AirJordan1.jpg" })}</div>
                {form.image && <div className="span-2 img-preview"><img src={imgSrc(form.image)} alt="Preview" onError={(e) => (e.currentTarget.style.display = "none")} onLoad={(e) => (e.currentTarget.style.display = "block")} /></div>}
              </div>
            </div>
            <div className="modal-foot">
              <button type="button" className="btn btn-outline" onClick={close} disabled={saving}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : null} {editing ? "Save changes" : "Create product"}</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
