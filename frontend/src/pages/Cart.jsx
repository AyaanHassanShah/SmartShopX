import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Icon from "../components/Icon";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import useDocumentTitle from "../hooks/useDocumentTitle";
import { imgSrc, money, FREE_SHIPPING } from "../utils/format";

export default function Cart() {
  useDocumentTitle("Your bag");
  const navigate = useNavigate();
  const toast = useToast();
  const { lines, count, subtotal, shipping, total, loading, busyId, setQty, remove } = useCart();

  const change = async (item, next) => {
    const r = await setQty(item._id, next);
    if (!r.ok) toast.error(r.message);
  };
  const del = async (item) => {
    const r = await remove(item._id);
    r.ok ? toast.success("Item removed") : toast.error(r.message);
  };

  if (loading && !lines.length) {
    return <Layout><div className="cart-layout"><div className="skeleton" style={{ height: 320, borderRadius: 18 }} /><div className="skeleton" style={{ height: 260, borderRadius: 18 }} /></div></Layout>;
  }

  if (!lines.length) {
    return (
      <Layout>
        <EmptyState icon="cart" title="Your bag is empty" text="Looks like you haven't added anything yet. Browse the catalogue and find something you like.">
          <Link to="/shop" className="btn btn-primary btn-lg">Start shopping</Link>
        </EmptyState>
      </Layout>
    );
  }

  const left = Math.max(FREE_SHIPPING - subtotal, 0);

  return (
    <Layout>
      <h1 className="page-title">Your bag</h1>
      <p className="page-sub">{count} {count === 1 ? "item" : "items"}</p>

      <div className="cart-layout">
        <div className="card">
          <div className="ship-meter">
            {left > 0 ? <p>Add <b>{money(left)}</b> more for <b>free shipping</b></p> : <p><Icon name="check" size={16} /> You've unlocked <b>free shipping</b></p>}
            <div className="bar"><span style={{ width: `${Math.min((subtotal / FREE_SHIPPING) * 100, 100)}%` }} /></div>
          </div>

          <ul className="cart-list">
            {lines.map((item) => {
              const p = item.product;
              const over = item.quantity >= p.countInStock;
              const busy = busyId === item._id;
              return (
                <li key={item._id} className={`cart-row${busy ? " busy" : ""}`}>
                  <Link to={`/product/${p._id}`} className="cart-thumb"><img src={imgSrc(p.image)} alt={p.name} /></Link>
                  <div className="cart-main">
                    <Link to={`/product/${p._id}`} className="cart-name">{p.name}</Link>
                    <div className="cart-meta">
                      {item.selectedColor && <span>Colour: {item.selectedColor}</span>}
                      {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                    </div>
                    {p.countInStock <= 5 && <span className="badge badge-warn">Only {p.countInStock} left</span>}
                    <div className="cart-ctrl">
                      <div className="qty">
                        <button onClick={() => change(item, item.quantity - 1)} disabled={busy || item.quantity <= 1} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button>
                        <span>{item.quantity}</span>
                        <button onClick={() => change(item, item.quantity + 1)} disabled={busy || over} aria-label="Increase quantity"><Icon name="plus" size={14} /></button>
                      </div>
                      <button className="link-btn danger" onClick={() => del(item)} disabled={busy}><Icon name="trash" size={14} /> Remove</button>
                    </div>
                  </div>
                  <div className="cart-price money">
                    <b>{money(p.price * item.quantity)}</b>
                    {item.quantity > 1 && <small>{money(p.price)} each</small>}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="card card-pad summary">
          <h2>Order summary</h2>
          <dl>
            <div><dt>Subtotal</dt><dd className="money">{money(subtotal)}</dd></div>
            <div><dt>Shipping</dt><dd className="money">{shipping === 0 ? "Free" : money(shipping)}</dd></div>
            <div className="total"><dt>Total</dt><dd className="money">{money(total)}</dd></div>
          </dl>
          <button className="btn btn-primary btn-lg btn-block" onClick={() => navigate("/checkout")}>Checkout <Icon name="arrowRight" size={18} /></button>
          <Link to="/shop" className="btn btn-ghost btn-block">Continue shopping</Link>
          <p className="secure"><Icon name="lock" size={14} /> Secure checkout</p>
        </aside>
      </div>
    </Layout>
  );
}
