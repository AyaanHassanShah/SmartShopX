import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { errMsg } from "../services/api";
import Layout from "../components/Layout";
import ProgressBar from "../components/ProgressBar";
import EmptyState from "../components/EmptyState";
import StatusBadge, { PaidBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { fmtDate, imgSrc, money, shortId } from "../utils/format";

const TABS = ["All", "Active", "Delivered", "Cancelled"];

export default function OrderHistory() {
  useDocumentTitle("My orders");
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("All");
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await API.get("/orders/my");
      setOrders(data);
      setError("");
    } catch (e) { setError(errMsg(e)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const act = async (id, path, okMsg) => {
    setBusy(id);
    try {
      const { data } = await API.put(`/orders/${id}/${path}`);
      setOrders((o) => o.map((x) => (x._id === id ? { ...x, ...data, orderItems: x.orderItems } : x)));
      toast.success(okMsg);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setBusy(null); }
  };

  const shown = orders.filter((o) =>
    tab === "All" ? true : tab === "Active" ? ["Pending", "Processing", "Shipped"].includes(o.status) : o.status === tab
  );

  return (
    <Layout>
      <h1 className="page-title">My orders</h1>
      <div className="tabs" role="tablist">
        {TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? "on" : ""} onClick={() => setTab(t)}>{t}</button>)}
      </div>

      {loading ? (
        <div style={{ display: "grid", gap: 16 }}>{[1, 2].map((n) => <div key={n} className="skeleton" style={{ height: 240, borderRadius: 18 }} />)}</div>
      ) : error ? (
        <div className="alert alert-error" role="alert">{error} <button className="link-btn" onClick={load}>Retry</button></div>
      ) : shown.length === 0 ? (
        <EmptyState icon="box" title={orders.length ? `No ${tab.toLowerCase()} orders` : "No orders yet"} text={orders.length ? "Try another tab." : "When you place an order it will show up here."}>
          {!orders.length && <Link to="/shop" className="btn btn-primary">Start shopping</Link>}
        </EmptyState>
      ) : (
        <div className="orders fade-in">
          {shown.map((o) => (
            <article key={o._id} className="card order">
              <header className="order-head">
                <div><small>Order</small><b>{shortId(o._id)}</b></div>
                <div><small>Placed</small><b>{fmtDate(o.createdAt)}</b></div>
                <div><small>Total</small><b className="money">{money(o.totalPrice)}</b></div>
                <div className="order-badges"><StatusBadge status={o.status} /><PaidBadge paid={o.isPaid} /></div>
              </header>

              <div className="order-track"><ProgressBar status={o.status} /></div>

              <ul className="order-items">
                {o.orderItems.map((it, i) => (
                  <li key={i}>
                    <img src={imgSrc(it.image || it.product?.image)} alt="" />
                    <div>
                      {it.product?._id ? <Link to={`/product/${it.product._id}`}><b>{it.name || it.product?.name}</b></Link> : <b>{it.name || "Item no longer available"}</b>}
                      <small>{[it.selectedColor, it.selectedSize && `Size ${it.selectedSize}`, `Qty ${it.quantity}`].filter(Boolean).join(" / ")}</small>
                    </div>
                    <span className="money">{it.price != null ? money(it.price * it.quantity) : ""}</span>
                  </li>
                ))}
              </ul>

              <footer className="order-foot">
                <small className="muted">{o.shippingAddress ? `Ship to: ${o.shippingAddress.address}, ${o.shippingAddress.city}` : ""} &middot; {o.paymentMethod}</small>
                <div className="order-actions">
                  {!o.isPaid && o.status !== "Cancelled" && o.paymentMethod !== "Cash on Delivery" && (
                    <button className="btn btn-primary btn-sm" disabled={busy === o._id} onClick={() => act(o._id, "pay", "Payment received")}>Pay now</button>
                  )}
                  {["Pending", "Processing"].includes(o.status) && (
                    <button className="btn btn-danger btn-sm" disabled={busy === o._id} onClick={() => window.confirm("Cancel this order?") && act(o._id, "cancel", "Order cancelled")}>Cancel order</button>
                  )}
                </div>
              </footer>
            </article>
          ))}
        </div>
      )}
    </Layout>
  );
}
