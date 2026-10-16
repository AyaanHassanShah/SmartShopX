import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { errMsg } from "../services/api";
import AdminLayout from "../components/AdminLayout";
import Icon from "../components/Icon";
import StatusBadge from "../components/StatusBadge";
import { fmtDate, imgSrc, money, shortId } from "../utils/format";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
const BAR = { Pending: "#f59e0b", Processing: "#2563eb", Shipped: "#0d9488", Delivered: "#16a34a", Cancelled: "#dc2626" };

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/admin/stats").then(({ data }) => setS(data)).catch((e) => setError(errMsg(e)));
  }, []);

  const cards = s && [
    { label: "Revenue (paid)", value: money(s.revenue), icon: "dollar", tone: "teal" },
    { label: "Orders", value: s.orders, icon: "box", tone: "blue" },
    { label: "Products", value: s.products, icon: "tag", tone: "amber" },
    { label: "Customers", value: s.users, icon: "users", tone: "violet" },
  ];
  const totalOrders = s ? Object.values(s.ordersByStatus).reduce((a, b) => a + b, 0) || 1 : 1;

  return (
    <AdminLayout title="Dashboard" subtitle="Live overview of your store">
      {error && <div className="alert alert-error">{error}</div>}
      {!s && !error && <div className="stat-grid">{[1, 2, 3, 4].map((n) => <div key={n} className="skeleton" style={{ height: 112, borderRadius: 18 }} />)}</div>}

      {s && (
        <>
          <div className="stat-grid">
            {cards.map((c) => (
              <div key={c.label} className="card stat">
                <span className={`stat-ico ${c.tone}`}><Icon name={c.icon} size={22} /></span>
                <div><small>{c.label}</small><b className="money">{c.value}</b></div>
              </div>
            ))}
          </div>

          <div className="admin-cols">
            <section className="card">
              <div className="card-head"><h2>Recent orders</h2><Link to="/admin/orders" className="link">View all <Icon name="arrowRight" size={14} /></Link></div>
              <div className="table-wrap">
                <table className="table">
                  <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {s.recentOrders.length === 0 && <tr><td colSpan="5" className="muted" style={{ textAlign: "center" }}>No orders yet</td></tr>}
                    {s.recentOrders.map((o) => (
                      <tr key={o._id}>
                        <td><b>{shortId(o._id)}</b></td>
                        <td>{o.user?.name || "Deleted user"}</td>
                        <td>{fmtDate(o.createdAt)}</td>
                        <td className="money">{money(o.totalPrice)}</td>
                        <td><StatusBadge status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <div style={{ display: "grid", gap: 20, alignContent: "start" }}>
              <section className="card card-pad">
                <h2 className="card-title">Orders by status</h2>
                <ul className="bars">
                  {STATUSES.map((st) => {
                    const n = s.ordersByStatus[st] || 0;
                    return (
                      <li key={st}>
                        <span>{st}</span>
                        <div className="bar"><span style={{ width: `${(n / totalOrders) * 100}%`, background: BAR[st] }} /></div>
                        <b>{n}</b>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="card card-pad">
                <div className="card-head flush"><h2 className="card-title">Low stock</h2><Link to="/admin/products" className="link">Manage</Link></div>
                {s.lowStock.length === 0 ? <p className="muted">All products are well stocked.</p> : (
                  <ul className="low-list">
                    {s.lowStock.map((p) => (
                      <li key={p._id}><img src={imgSrc(p.image)} alt="" /><div><b>{p.name}</b><small>{p.category}</small></div>
                        <span className={`badge ${p.countInStock === 0 ? "badge-danger" : "badge-warn"}`}>{p.countInStock === 0 ? "Out" : `${p.countInStock} left`}</span></li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
