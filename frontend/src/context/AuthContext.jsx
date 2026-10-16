import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

const AuthContext = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

const read = () => {
  try { return JSON.parse(localStorage.getItem("userInfo") || "null"); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(read);

  const login = useCallback((data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("userInfo", JSON.stringify(data));
    setUser(data);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    setUser(null);
  }, []);

  // Server told us the token is dead
  useEffect(() => {
    const onLogout = () => setUser(null);
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  // Re-validate stored session once (also refreshes isAdmin if it changed)
  useEffect(() => {
    if (!localStorage.getItem("token")) return;
    API.get("/auth/me")
      .then(({ data }) => {
        setUser((u) => {
          const next = { ...(u || {}), ...data };
          localStorage.setItem("userInfo", JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {});
  }, []);

  const value = useMemo(() => ({ user, isAuthed: !!user, isAdmin: !!user?.isAdmin, login, logout }), [user, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
