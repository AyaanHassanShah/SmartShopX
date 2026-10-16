import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API, { errMsg } from "../services/api";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { imgSrc, money, shortId } from "../utils/format";

const COUNTRIES = ["Pakistan", "India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "United Arab Emirates", "Saudi Arabia", "China", "Japan"];
const METHODS = [
  { v: "Card", t: "Credit / debit card", d: "Pay now (demo gateway)", i: "card" },
  { v: "PayPal", t: "PayPal", d: "Pay now (demo gateway)", i: "shield" },
  { v: "Cash on Delivery", t: "Cash on delivery", d: "Pay when it arrives", i: "box" },
];
const FIELDS = {
  address: (v) => (v.trim().length < 5 ? "Enter your street address" : ""),
  city: (v) => (v.trim().length < 2 ? "Enter your city" : ""),
  postalCode: (v) => (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(v.trim()) ? "Enter a valid postal code" : ""),
  country: (v) => (!v.trim() ? "Select your country" : ""),
};

export default function Checkout() {
  useDocumentTitle("Checkout");
  const navigate = useNavigate();
  const toast = useToast();
  const { lines, subtotal, shipping, total, loading, refresh, clearLocal } = useCart();

  const [step, setStep] = useState(1); // 1 address, 2 payment + review, 3 done
  const [addr, setAddr] = useState(() => { try { return JSON.parse(localStorage.getItem("shipTo")) || { address: "", city: "", postalCode: "", country: "" }; } catch { return { address: "", city: "", postalCode: "", country: "" }; } });
  const [touched, setTouched] = useState({});
  const [method, setMethod] = useState("Card");
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => { refresh(); }, [refresh]);

  const errors = Object.fromEntries(Object.entries(FIELDS).map(([k, f]) => [k, f(addr[k] || "")]));
  const valid = Object.values(errors).every((e) => !e);
  const set = (k) => (e) => setAddr((a) => ({ ...a, [k]: e.target.value }));
  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  const next = (e) => {
    e.preventDefault();
    setTouched({ address: true, city: true, postalCode: true, country: true });
    if (!valid) return;
    localStorage.setItem("shipTo", JSON.stringify(addr));
    setStep(2);
    window.scrollTo(0, 0);
  };

  // One action: create order, then (for online methods) pay. No orphan/duplicate orders.
  const place = async () => {
    setPlacing(true); setError("");
    try {
      const { data: created } = await API.post("/orders", { shippingAddress: addr, paymentMethod: method });
      let final = created;
      if (method !== "Cash on Delivery") {
        try { final = (await API.put(`/orders/${created._id}/pay`)).data; }
        catch { toast.error("Order placed, but payment failed. You can pay from My orders."); }
      }
      setOrder(final);
      clearLocal();
      setStep(3);
      window.scrollTo(0, 0);
    } catch (e) {
      setError(errMsg(e));
      if (e.response?.status === 400) refresh();
    } finally {
      setPlacing(false);
    }
  };

  if (step < 3 && !loading && lines.length === 0) {
    return <Layout><EmptyState icon="cart" title="Nothing to check out" text="Your bag is empty."><Link to="/shop" className="btn btn-primary">Browse products</Link></EmptyState></Layout>;
  }

  const stepper = (
    <ol className="stepper" aria-label="Checkout progress">
      {["Delivery", "Payment", "Done"].map((l, i) => (
        <li key={l} className={step > i + 1 ? "done" : step === i + 1 ? "current" : ""}>
          <span className="dot">{step > i + 1 ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>{l}
        </li>
      ))}
    </ol>
  );

  if (step === 3 && order) {
    return (
      <Layout>
        <div className="success fade-in">
          <div className="success-ico"><Icon name="check" size={40} stroke={3} /></div>
          <h1>Thank you, your order is in!</h1>
          <p className="muted">Order <b>{shortId(order._id)}</b> &middot; {order.isPaid ? "Payment received" : "Pay on delivery"} &middot; Total <b>{money(order.totalPrice)}</b></p>
          <p className="muted">A confirmation email is on its way. We'll update you as it ships.</p>
          <div className="success-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate("/orders")}>Track my order</button>
            <Link to="/shop" className="btn btn-outline btn-lg">Continue shopping</Link>
          </div>
        </div>
      </Layout>
    );
  }

  const fld = (k, label, props = {}) => (
    <div className="field">
      <label className="label" htmlFor={k}>{label}</label>
      <input id={k} className={`input${touched[k] && errors[k] ? " invalid" : ""}`} value={addr[k]} onChange={set(k)} onBlur={blur(k)} aria-invalid={!!(touched[k] && errors[k])} {...props} />
      {touched[k] && errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <Layout>
      <h1 className="page-title">Checkout</h1>
      {stepper}

      <div className="cart-layout">
        <div>
          {step === 1 && (
            <form className="card card-pad fade-in" onSubmit={next} noValidate>
              <h2 className="sec-title"><Icon name="pin" size={20} /> Delivery address</h2>
              <div className="form-grid">
                <div className="span-2">{fld("address", "Street address", { placeholder: "House, street, area", autoComplete: "street-address" })}</div>
                {fld("city", "City", { placeholder: "e.g. Lahore", autoComplete: "address-level2" })}
                {fld("postalCode", "Postal code", { placeholder: "e.g. 54000", autoComplete: "postal-code" })}
                <div className="span-2 field">
                  <label className="label" htmlFor="country">Country</label>
                  <select id="country" className={`select${touched.country && errors.country ? " invalid" : ""}`} value={addr.country} onChange={set("country")} onBlur={blur("country")}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  {touched.country && errors.country && <span className="field-error">{errors.country}</span>}
                </div>
              </div>
              <div className="form-actions"><button className="btn btn-primary btn-lg" type="submit">Continue to payment <Icon name="arrowRight" size={18} /></button></div>
            </form>
          )}

          {step === 2 && (
            <div className="card card-pad fade-in">
              <h2 className="sec-title"><Icon name="card" size={20} /> Payment method</h2>
              <div className="methods" role="radiogroup" aria-label="Payment method">
                {METHODS.map((m) => (
                  <label key={m.v} className={`method${method === m.v ? " on" : ""}`}>
                    <input type="radio" name="method" checked={method === m.v} onChange={() => setMethod(m.v)} />
                    <Icon name={m.i} size={22} /><div><b>{m.t}</b><small>{m.d}</small></div>
                  </label>
                ))}
              </div>
              <p className="field-hint" style={{ marginTop: 10 }}>This store uses a simulated payment flow: no real card is charged and no card details are collected.</p>

              <hr className="divider" />
              <div className="review-addr">
                <div><small className="muted">Delivering to</small><p><b>{addr.address}</b>, {addr.city} {addr.postalCode}, {addr.country}</p></div>
                <button className="link-btn" onClick={() => setStep(1)}>Edit</button>
              </div>

              {error && <div className="alert alert-error" role="alert" style={{ marginTop: 16 }}>{error}</div>}
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setStep(1)} disabled={placing}>Back</button>
                <button className="btn btn-primary btn-lg" onClick={place} disabled={placing}>{placing ? <><span className="spinner" /> Placing order...</> : `Place order - ${money(total)}`}</button>
              </div>
            </div>
          )}
        </div>

        <aside className="card card-pad summary">
          <h2>In your bag</h2>
          <ul className="mini-list">
            {lines.map((l) => (
              <li key={l._id}>
                <div className="mini-img"><img src={imgSrc(l.product.image)} alt="" /><span>{l.quantity}</span></div>
                <div><b>{l.product.name}</b><small>{[l.selectedColor, l.selectedSize && `Size ${l.selectedSize}`].filter(Boolean).join(" / ")}</small></div>
                <span className="money">{money(l.product.price * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl>
            <div><dt>Subtotal</dt><dd className="money">{money(subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd className="money">{shipping === 0 ? "Free" : money(shipping)}</dd></div>
            <div className="total"><dt>Total</dt><dd className="money">{money(total)}</dd></div>
          </dl>
        </aside>
      </div>
    </Layout>
  );
}
