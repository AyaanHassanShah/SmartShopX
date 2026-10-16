const express = require("express");
const router = express.Router();

const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQty
} = require("../controllers/cartController");

const { protect } = require("../middleware/authMiddleware");

// All routes protected (user must be logged in)
router.post("/", protect, addToCart);
router.get("/", protect, getCart);
router.put("/update", protect, updateCartQty);
router.delete("/remove/:itemId", protect, removeFromCart);

module.exports = router;