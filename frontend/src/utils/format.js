import { API_ORIGIN } from "../services/api";

export const money = (n = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 }).format(n);

export const imgSrc = (img = "") =>
  !img ? "" : /^(https?:|data:)/.test(img) ? img : `${API_ORIGIN}/uploads/${img}`;

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "-";

export const shortId = (id = "") => `#${String(id).slice(-8).toUpperCase()}`;

export const FREE_SHIPPING = 150;
export const SHIPPING_FEE = 15;
export const shippingFor = (subtotal) => (subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE);

export const COLOR_HEX = {
  black: "#111827", white: "#ffffff", red: "#dc2626", blue: "#2563eb", green: "#16a34a",
  grey: "#9ca3af", gray: "#9ca3af", navy: "#1e3a8a", orange: "#f97316", yellow: "#facc15",
  brown: "#92400e", pink: "#ec4899", purple: "#7c3aed", beige: "#d6c3a3", olive: "#65a30d",
  silver: "#cbd5e1", gold: "#d4a017", cream: "#f5efe0", teal: "#0d9488", maroon: "#7f1d1d",
};
export const colorHex = (name = "") => COLOR_HEX[name.toLowerCase()] || "#cbd5e1";
