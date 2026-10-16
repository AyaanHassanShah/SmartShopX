const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    image: { type: String, required: true, trim: true },
    countInStock: { type: Number, required: true, default: 0, min: 0 },
    colors: [{ type: String, trim: true }],
    sizes: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

module.exports = mongoose.model("Product", productSchema);
