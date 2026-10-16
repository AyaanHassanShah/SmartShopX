const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  payOrder,
  cancelOrder
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// User
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.put("/:id/pay", protect, payOrder);
router.put("/:id/cancel", protect, cancelOrder);

// Admin
router.get("/", protect, admin, getAllOrders);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
