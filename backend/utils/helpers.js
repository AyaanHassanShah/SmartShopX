const mongoose = require("mongoose");

const escapeRegex = (s = "") => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// "Black, White" | ["Black","White"] -> ["Black","White"]
const toList = (v) =>
  (Array.isArray(v) ? v : String(v ?? "").split(","))
    .map((x) => String(x).trim())
    .filter(Boolean);

const toNumberList = (v) =>
  toList(v)
    .map(Number)
    .filter((n) => Number.isFinite(n));

const toSizeList = (v) =>
  [...new Set(toList(v).map((size) => size.toUpperCase()))];

const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_FEE = 15;
const shippingFor = (itemsPrice) =>
  itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

module.exports = {
  escapeRegex,
  isValidId,
  toList,
  toNumberList,
  toSizeList,
  shippingFor,
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FEE
};
