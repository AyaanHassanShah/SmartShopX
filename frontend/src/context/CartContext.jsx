import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API, { errMsg } from "../services/api";
import { useAuth } from "./AuthContext";
import { shippingFor } from "../utils/format";

const CartContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);

const EMPTY = { products: [] };

export function CartProvider({ children }) {
  const { isAuthed } = useAuth();
  const [cart, setCart] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("token")) { setCart(EMPTY); return; }
    setLoading(true);
    try {
      const { data } = await API.get("/cart");
      setCart(data?.products ? data : EMPTY);
    } catch {
      /* 401 handled globally */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthed) refresh();
    else setCart(EMPTY);
  }, [isAuthed, refresh]);

  // All mutations return { ok, message } so pages decide how to show feedback
  const run = async (fn) => {
    try {
      const { data } = await fn();
      setCart(data);
      return { ok: true };
    } catch (e) {
      return { ok: false, message: errMsg(e), status: e?.response?.status };
    }
  };

  const add = (payload) => run(() => API.post("/cart", payload));
  const setQty = async (itemId, quantity) => {
    setBusyId(itemId);
    const r = await run(() => API.put("/cart/update", { itemId, quantity }));
    setBusyId(null);
    return r;
  };
  const remove = async (itemId) => {
    setBusyId(itemId);
    const r = await run(() => API.delete(`/cart/remove/${itemId}`));
    setBusyId(null);
    return r;
  };
  const clearLocal = () => setCart(EMPTY);

  const value = useMemo(() => {
    const lines = cart.products || [];
    const count = lines.reduce((n, l) => n + l.quantity, 0);
    const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
    const shipping = shippingFor(subtotal);
    return { cart, lines, count, subtotal, shipping, total: subtotal + shipping, loading, busyId, refresh, add, setQty, remove, clearLocal };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, loading, busyId, refresh]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
