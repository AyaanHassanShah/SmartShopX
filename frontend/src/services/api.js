import axios from "axios";

export const API_ORIGIN = import.meta.env.VITE_API_URL || "";

const API = axios.create({ baseURL: `${API_ORIGIN}/api`, timeout: 15000 });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Expired / invalid session -> clear it and tell the app (AuthContext listens)
API.interceptors.response.use(
  (res) => res,
  (error) => {
    const url = error.config?.url || "";
    if (error.response?.status === 401 && !url.includes("/auth/login") && !url.includes("/auth/register")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      window.dispatchEvent(new Event("auth:logout"));
    }
    return Promise.reject(error);
  }
);

export const errMsg = (e, fallback = "Something went wrong. Please try again.") =>
  e?.response?.data?.message ||
  (e?.code === "ERR_NETWORK" ? "Can't reach the server. Is the backend running?" : fallback);

export default API;
