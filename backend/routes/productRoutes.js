const express = require("express");
const router = express.Router();

const {
  getProducts,
  getFilters,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  searchProducts
} = require("../controllers/productController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Public (static paths must stay above "/:id")
router.get("/", getProducts);
router.get("/filters", getFilters);
router.get("/search", searchProducts);
router.get("/top", getTopProducts);
router.get("/:id", getProductById);

// Admin
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
