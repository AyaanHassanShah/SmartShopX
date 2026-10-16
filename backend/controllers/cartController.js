const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { isValidId } = require("../utils/helpers");

const populated = async (userId) => {
  const cart = await Cart.findOne({ user: userId }).populate("products.product");
  if (!cart) return { products: [] };

  // Drop lines whose product was deleted by an admin
  const live = cart.products.filter((p) => p.product);
  if (live.length !== cart.products.length) {
    cart.products = live;
    await cart.save();
  }
  return cart;
};

// POST /api/cart
const addToCart = async (req, res) => {
  try {
    const { productId, selectedColor } = req.body;
    const quantity = Number(req.body.quantity ?? 1);
    const selectedSize = req.body.selectedSize !== undefined && req.body.selectedSize !== ""
      ? String(req.body.selectedSize).trim().toUpperCase()
      : undefined;

    if (!isValidId(productId)) return res.status(400).json({ message: "Invalid product" });
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.countInStock < 1) return res.status(400).json({ message: "This item is sold out" });

    if (product.colors?.length && !product.colors.includes(selectedColor)) {
      return res.status(400).json({ message: "Please choose a valid colour" });
    }
    if (product.sizes?.length && !product.sizes.includes(selectedSize)) {
      return res.status(400).json({ message: "Please choose a valid size" });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, products: [] });

    const existing = cart.products.find(
      (p) =>
        p.product.toString() === productId &&
        p.selectedColor === selectedColor &&
        p.selectedSize === selectedSize
    );

    const newQty = (existing?.quantity || 0) + quantity;
    if (newQty > product.countInStock) {
      return res.status(400).json({
        message: `Only ${product.countInStock} in stock${existing ? ` (you already have ${existing.quantity} in your bag)` : ""}`
      });
    }

    if (existing) existing.quantity = newQty;
    else cart.products.push({ product: productId, quantity, selectedColor, selectedSize });

    await cart.save();
    res.json(await populated(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    res.json(await populated(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/cart/update
const updateCartQty = async (req, res) => {
  try {
    const { itemId } = req.body;
    const quantity = Number(req.body.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.products.find((p) => p._id.toString() === itemId);
    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ message: "Product no longer available" });
    if (quantity > product.countInStock) {
      return res.status(400).json({ message: `Only ${product.countInStock} in stock` });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(await populated(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/cart/remove/:itemId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.products = cart.products.filter((p) => p._id.toString() !== req.params.itemId);
    await cart.save();
    res.json(await populated(req.user._id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCart, removeFromCart, updateCartQty };
