const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendOrderConfirmationEmail } = require("../utils/emailUtils");
const { isValidId, shippingFor } = require("../utils/helpers");

const PAYMENT_METHODS = ["Card", "PayPal", "Cash on Delivery"];
const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const restoreStock = async (items) => {
  await Promise.all(
    items.map((i) =>
      i.product ? Product.updateOne({ _id: i.product }, { $inc: { countInStock: i.quantity } }) : null
    )
  );
};

// @route POST /api/orders
// Prices, shipping and stock are all computed server-side from the cart.
const createOrder = async (req, res) => {
  const reserved = [];
  try {
    const { shippingAddress = {}, paymentMethod = "Card" } = req.body;
    const addr = {};
    for (const k of ["address", "city", "postalCode", "country"]) {
      addr[k] = String(shippingAddress[k] || "").trim();
      if (!addr[k]) return res.status(400).json({ message: "Please complete your delivery address" });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Unsupported payment method" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate("products.product");
    const lines = (cart?.products || []).filter((p) => p.product);
    if (!lines.length) return res.status(400).json({ message: "Your bag is empty" });

    // Atomically reserve stock line by line; roll back if anything is short.
    for (const line of lines) {
      const ok = await Product.findOneAndUpdate(
        { _id: line.product._id, countInStock: { $gte: line.quantity } },
        { $inc: { countInStock: -line.quantity } }
      );
      if (!ok) {
        await restoreStock(reserved);
        return res.status(400).json({
          message: `"${line.product.name}" no longer has enough stock. Please update your bag.`
        });
      }
      reserved.push({ product: line.product._id, quantity: line.quantity });
    }

    const orderItems = lines.map((l) => ({
      product: l.product._id,
      name: l.product.name,
      image: l.product.image,
      price: l.product.price,
      quantity: l.quantity,
      selectedColor: l.selectedColor,
      selectedSize: l.selectedSize
    }));
    const itemsPrice = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingPrice = shippingFor(itemsPrice);

    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress: addr,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice: itemsPrice + shippingPrice
    });

    cart.products = [];
    await cart.save();

    // Non-blocking confirmation email
    User.findById(req.user._id)
      .then((u) => sendOrderConfirmationEmail(u, order))
      .catch((e) => console.error("Order email error:", e.message));

    res.status(201).json(order);
  } catch (error) {
    if (reserved.length) await restoreStock(reserved).catch(() => {});
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate("orderItems.product", "name image");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/orders  (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/status  (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid status" });
    if (!isValidId(req.params.id)) return res.status(404).json({ message: "Order not found" });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "A cancelled order can't be changed" });
    }

    if (status === "Cancelled") {
      await restoreStock(order.orderItems);
      order.cancelledAt = new Date();
    }
    if (status === "Shipped") order.shippedAt = new Date();
    if (status === "Delivered") {
      order.deliveredAt = new Date();
      if (!order.isPaid && order.paymentMethod === "Cash on Delivery") {
        order.isPaid = true;
        order.paidAt = new Date();
      }
    }

    order.status = status;
    res.json(await order.save());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/pay  (owner only; simulated gateway)
const payOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: "Order not found" });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This isn't your order" });
    }
    if (order.status === "Cancelled") return res.status(400).json({ message: "Order was cancelled" });
    if (order.isPaid) return res.status(400).json({ message: "Order is already paid" });

    order.isPaid = true;
    order.paidAt = new Date();
    if (order.status === "Pending") order.status = "Processing";
    res.json(await order.save());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/orders/:id/cancel  (owner, before shipping)
const cancelOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: "Order not found" });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "This isn't your order" });
    }
    if (!["Pending", "Processing"].includes(order.status)) {
      return res.status(400).json({ message: "This order has already shipped and can't be cancelled" });
    }

    await restoreStock(order.orderItems);
    order.status = "Cancelled";
    order.cancelledAt = new Date();
    res.json(await order.save());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getAllOrders, updateOrderStatus, payOrder, cancelOrder };
