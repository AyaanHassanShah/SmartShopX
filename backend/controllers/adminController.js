const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [users, products, orders, revenueAgg, byStatus, recentOrders, lowStock] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { isPaid: true, status: { $ne: "Cancelled" } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "name email"),
      Product.find({ countInStock: { $lte: 5 } }).sort({ countInStock: 1 }).limit(6).select("name image countInStock category")
    ]);

    res.json({
      users,
      products,
      orders,
      revenue: revenueAgg[0]?.total || 0,
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      recentOrders,
      lowStock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
