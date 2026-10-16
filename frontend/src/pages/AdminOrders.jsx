import { Fragment, useCallback, useEffect, useState } from "react";
import API, { errMsg } from "../services/api";
import AdminLayout from "../components/AdminLayout";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";
import StatusBadge, { PaidBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { fmtDate, imgSrc, money, shortId } from "../utils/format";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("All");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try { setOrders((await API.get("/orders")).data); setError(""); }
    catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const updateStatus = async (o, status) => {
    if (status === o.status) return;
    if (status === "Cancelled" && !window.confirm("Cancel this order? Stock will be returned to inventory.")) return;
    setBusy(o._id);
    try {
      const { data } = await API.put(`/orders/${o._id}/status`, { status });
      setOrders((list) => list.map((x) => (x._id === o._id ? { ...x, ...data } : x)));
      toast.success(`Order ${shortId(o._id)} marked ${status}`);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setBusy(null); }
  };

  const counts = orders.reduce((m, o) => ({ ...m, [o.status]: (m[o.status] || 0) + 1 }), {});
  const needle = q.trim().toLowerCase();
  const shown = orders.filter((o) =>
    (tab === "All" || o.status === tab) &&
    (!needle || o._id.toLowerCase().includes(needle) || o.user?.name?.toLowerCase().includes(needle) || o.user?.email?.toLowerCase().includes(needle))
  );

  return (
    <AdminLayout title="Orders" subtitle={`${orders.length} total orders`}>
      <div className="card">
        <div className="tabs flush" role="tablist">
          {["All", ...STATUSES].map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>
              {t} <span className="count">{t === "All" ? orders.length : counts[t] || 0}</span>
            </button>
          ))}
        </div>
        <div className="table-tools">
          <div className="input-wrap grow"><Icon name="search" size={18} className="icon-left" /><input className="input" placeholder="Search by order ID, customer name or email..." value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" /></div>
        </div>

        {loading ? (
          <div style={{ padding: 20, display: "grid", gap: 10 }}>{Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}</div>
        ) : error ? (
          <div className="alert alert-error" style={{ margin: 20 }}>{error} <button className="link-btn" onClick={load}>Retry</button></div>
        ) : shown.length === 0 ? (
          <EmptyState icon="box" title="No orders match" text="Try another status or search term." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th></th><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th></tr></thead>
              <tbody>
                {shown.map((o) => (
                  <Fragment key={o._id}>
                    <tr>
                      <td><button className="btn-icon" style={{ width: 32, height: 32 }} onClick={() => setOpenId(openId === o._id ? null : o._id)} aria-expanded={openId === o._id} aria-label="Toggle details"><Icon name={openId === o._id ? "chevDown" : "chevRight"} size={16} /></button></td>
                      <td><b>{shortId(o._id)}</b></td>
                      <td><b>{o.user?.name || "Deleted user"}</b><small className="muted" style={{ display: "block" }}>{o.user?.email}</small></td>
                      <td>{fmtDate(o.createdAt)}</td>
                      <td className="money">{money(o.totalPrice)}</td>
                      <td><PaidBadge paid={o.isPaid} /></td>
                      <td><StatusBadge status={o.status} /></td>
                      <td>
                        <select className="select" style={{ height: 36, minWidth: 130 }} value={o.status} disabled={busy === o._id || o.status === "Cancelled"} onChange={(e) => updateStatus(o, e.target.value)} aria-label={`Update status for ${shortId(o._id)}`}>
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                    {openId === o._id && (
                      <tr className="detail-row"><td colSpan="8">
                        <div className="detail">
                          <ul className="order-items">
                            {o.orderItems.map((it, i) => (
                              <li key={i}><img src={imgSrc(it.image)} alt="" /><div><b>{it.name || "Item"}</b><small>{[it.selectedColor, it.selectedSize && `Size ${it.selectedSize}`, `Qty ${it.quantity}`].filter(Boolean).join(" / ")}</small></div><span className="money">{money((it.price || 0) * it.quantity)}</span></li>
                            ))}
                          </ul>
                          <div className="detail-side">
                            <small className="muted">Ship to</small>
                            <p>{o.shippingAddress ? `${o.shippingAddress.address}, ${o.shippingAddress.city} ${o.shippingAddress.postalCode}, ${o.shippingAddress.country}` : "Not provided"}</p>
                            <small className="muted">Payment method</small><p>{o.paymentMethod}</p>
                            <small className="muted">Items {money(o.itemsPrice ?? o.totalPrice)} / Shipping {money(o.shippingPrice ?? 0)}</small>
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
