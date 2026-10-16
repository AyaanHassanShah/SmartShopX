const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const sizesFor = (category) => {
  const normalized = String(category || "").toLowerCase();
  if (normalized.includes("shoe")) return ["39", "40", "41", "42", "43", "44", "45"];
  if (normalized.includes("clothes") || normalized.includes("apparel")) return ["S", "M", "L", "XL", "XXL"];
  return null;
};

async function backfill() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const products = await Product.find({ category: { $in: [/shoe/i, /clothes/i, /apparel/i] } });
    let updated = 0;

    for (const product of products) {
      const sizes = sizesFor(product.category);
      if (sizes && (!product.sizes || product.sizes.length === 0)) {
        product.sizes = sizes;
        await product.save();
        updated += 1;
      }
    }

    console.log(`Backfilled sizes for ${updated} products.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error("Size backfill failed:", error.message);
    process.exit(1);
  }
}

backfill();
