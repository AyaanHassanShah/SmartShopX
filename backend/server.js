const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

dotenv.config();
const connectDB = require("./Config/db");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

if (!process.env.JWT_SECRET || !process.env.MONGO_URI) {
  console.error("Missing MONGO_URI or JWT_SECRET in backend/.env");
  process.exit(1);
}
connectDB();

const app = express();

// Security + parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // allow <img> from the Vite origin
app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
        .split(",")
        .map((value) => value.trim());
      const isLocalDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || "");
      callback(null, !origin || configuredOrigins.includes(origin) || isLocalDevOrigin);
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

// Rate limits (brute-force protection on auth, general ceiling elsewhere)
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, standardHeaders: true, legacyHeaders: false }));
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." }
});

app.get("/", (req, res) => res.send("Smart Shop X API running"));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads"), { maxAge: "7d" }));

// 404 + error handler
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }));
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
