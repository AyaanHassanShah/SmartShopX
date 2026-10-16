import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import Icon from "../components/Icon";

const ToastContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const id = useRef(0);

  const dismiss = useCallback((tid) => setToasts((t) => t.filter((x) => x.id !== tid)), []);
  const push = useCallback(
    (message, type = "success") => {
      const tid = ++id.current;
      setToasts((t) => [...t.slice(-3), { id: tid, message, type }]);
      setTimeout(() => dismiss(tid), 4200);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({ success: (m) => push(m, "success"), error: (m) => push(m, "error") }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="t-ico"><Icon name={t.type === "error" ? "x" : "check"} size={16} /></span>
            <span className="t-body">
              <span className="t-label">{t.type === "error" ? "Error" : "Success"}</span>
              <span className="t-msg">{t.message}</span>
            </span>
            <button className="t-x" onClick={() => dismiss(t.id)} aria-label="Dismiss"><Icon name="x" size={14} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
