/**
 * seedProducts.js
 * Run with: npm run seed  (from /backend). Safe to re-run: skips names that already exist.
 * Seeds 20 additional products across Shoes, Caps, Clothes, Accessories, Sports categories.
 */

const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const Product = require("../models/Product");

const products = [
  // ── SHOES ──────────────────────────────────
  {
    name: "Air Phantom Elite",
    price: 189,
    description: "Lightweight performance runner with responsive cushioning foam and breathable flyknit upper. Built for speed, designed for streets.",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    countInStock: 24,
    colors: ["Black", "White", "Red"],
    sizes: [39, 40, 41, 42, 43, 44, 45]
  },
  {
    name: "Urban Stride Pro",
    price: 145,
    description: "Versatile everyday sneaker with a premium suede upper, memory foam insole, and durable rubber outsole for all-day comfort.",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80",
    countInStock: 18,
    colors: ["White", "Grey", "Navy"],
    sizes: [38, 39, 40, 41, 42, 43, 44]
  },
  {
    name: "Zenith Court Classic",
    price: 119,
    description: "Clean, minimal silhouette inspired by classic tennis courts. Full grain leather upper with cushioned ankle collar.",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773d3028?w=600&q=80",
    countInStock: 30,
    colors: ["White", "Black"],
    sizes: [39, 40, 41, 42, 43, 44, 45]
  },
  {
    name: "Trail Blazer X2",
    price: 165,
    description: "All-terrain trail runner with aggressive tread, waterproof mesh upper, and heel brake stabiliser for rugged terrain.",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80",
    countInStock: 15,
    colors: ["Black", "Green", "Orange"],
    sizes: [40, 41, 42, 43, 44, 45]
  },
  {
    name: "Velocity Boost 3.0",
    price: 220,
    description: "Competition-grade track and field shoe with carbon fibre plate, ultra-responsive foam stack, and precision lacing system.",
    category: "Shoes",
    image: "https://images.unsplash.com/photo-1556048219-bb6978360b84?w=600&q=80",
    countInStock: 10,
    colors: ["Red", "Black", "White"],
    sizes: [39, 40, 41, 42, 43, 44]
  },

  // ── CAPS ──────────────────────────────────
  {
    name: "Classic 6-Panel Cap",
    price: 38,
    description: "Timeless structured 6-panel cap in premium cotton twill. Adjustable back strap with brass buckle closure.",
    category: "Caps",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
    countInStock: 50,
    colors: ["Black", "White", "Navy", "Grey"],
    sizes: []
  },
  {
    name: "Vintage Trucker Cap",
    price: 42,
    description: "Retro-inspired mesh trucker with foam-front and snapback closure. Moisture-wicking sweatband for all-day comfort.",
    category: "Caps",
    image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80",
    countInStock: 35,
    colors: ["Black", "Khaki", "Red"],
    sizes: []
  },
  {
    name: "Performance Golf Cap",
    price: 55,
    description: "Lightweight UV-protection golf cap with DryFit technology, pre-curved brim, and laser-perforated panels for ventilation.",
    category: "Caps",
    image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&q=80",
    countInStock: 22,
    colors: ["White", "Grey", "Navy"],
    sizes: []
  },
  {
    name: "Wool Beanie Luxe",
    price: 49,
    description: "Merino wool beanie in a classic ribbed design. Naturally temperature-regulating and ultra-soft against the skin.",
    category: "Caps",
    image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=600&q=80",
    countInStock: 40,
    colors: ["Charcoal", "Cream", "Black", "Burgundy"],
    sizes: []
  },

  // ── CLOTHES ──────────────────────────────────
  {
    name: "Essential Oversized Tee",
    price: 55,
    description: "Heavyweight 240gsm cotton oversized tee with dropped shoulders and a boxy silhouette. Pre-washed for a lived-in feel.",
    category: "Clothes",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
    countInStock: 60,
    colors: ["White", "Black", "Sand", "Slate Blue"],
    sizes: [38, 40, 42, 44, 46]
  },
  {
    name: "Premium Jogger Set",
    price: 120,
    description: "Matching jogger and hoodie set in brushed French terry. Elastic waistband, kangaroo pocket, and ribbed cuffs.",
    category: "Clothes",
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    countInStock: 28,
    colors: ["Black", "Grey", "Navy"],
    sizes: [38, 40, 42, 44, 46, 48]
  },
  {
    name: "Technical Running Jacket",
    price: 185,
    description: "Packable windbreaker with waterproof coating, taped seams, and reflective detailing for low-light visibility.",
    category: "Clothes",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
    countInStock: 16,
    colors: ["Black", "Olive", "Navy"],
    sizes: [38, 40, 42, 44, 46]
  },
  {
    name: "Stretch Training Shorts",
    price: 68,
    description: "4-way stretch training shorts with inner liner, zippered back pocket, and moisture-wicking fabric for intense sessions.",
    category: "Clothes",
    image: "https://images.unsplash.com/photo-1593164842264-854604db2260?w=600&q=80",
    countInStock: 45,
    colors: ["Black", "Grey", "Red"],
    sizes: [38, 40, 42, 44, 46]
  },

  // ── ACCESSORIES ──────────────────────────────────
  {
    name: "Sport Duffel Bag",
    price: 95,
    description: "Durable 40L duffel with padded shoe compartment, ventilated mesh pockets, and reinforced carry handles.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    countInStock: 20,
    colors: ["Black", "Navy", "Grey"],
    sizes: []
  },
  {
    name: "Precision Training Watch",
    price: 249,
    description: "GPS-enabled sports watch with heart rate monitor, VO2 Max tracking, 14-day battery life, and 50m water resistance.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    countInStock: 12,
    colors: ["Black", "Silver", "Rose Gold"],
    sizes: []
  },
  {
    name: "Compression Socks Pack",
    price: 28,
    description: "3-pack of graduated compression socks for performance and recovery. Arch support and moisture-wicking yarn blend.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80",
    countInStock: 80,
    colors: ["Black", "White", "Grey"],
    sizes: [39, 40, 41, 42, 43, 44, 45]
  },
  {
    name: "Reflective Running Belt",
    price: 34,
    description: "360° reflective running belt with expandable zippered pocket. Fits phones up to 6.7 inches. Bounce-free design.",
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
    countInStock: 33,
    colors: ["Black", "Orange", "Yellow"],
    sizes: []
  },

  // ── SPORTS ──────────────────────────────────
  {
    name: "Pro Resistance Bands Set",
    price: 44,
    description: "Set of 5 progressive resistance bands (5–50kg) in natural latex with carry bag and exercise guide.",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
    countInStock: 55,
    colors: ["Black", "Grey"],
    sizes: []
  },
  {
    name: "Premium Jump Rope",
    price: 29,
    description: "Speed jump rope with ball-bearing swivel handles, adjustable steel cable, and non-slip ergonomic grip.",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=600&q=80",
    countInStock: 70,
    colors: ["Black", "Red"],
    sizes: []
  },
  {
    name: "Foam Roller Pro",
    price: 52,
    description: "High-density EVA foam roller with grid surface for deep tissue myofascial release and muscle recovery.",
    category: "Sports",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    countInStock: 40,
    colors: ["Black", "Blue"],
    sizes: []
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const existingProducts = await Product.find({}, "name category sizes");
    for (const product of existingProducts) {
      const category = String(product.category || "").toLowerCase();
      const defaultSizes = category.includes("shoe")
        ? ["39", "40", "41", "42", "43", "44", "45"]
        : category.includes("clothes") || category.includes("apparel")
          ? ["S", "M", "L", "XL", "XXL"]
          : null;
      if (defaultSizes && (!product.sizes || product.sizes.length === 0)) {
        product.sizes = defaultSizes;
        await product.save();
      }
    }

    const existing = new Set(existingProducts.map((p) => p.name));
    const fresh = products.filter((p) => !existing.has(p.name));
    const inserted = fresh.length ? await Product.insertMany(fresh) : [];
    console.log(`✅ Successfully seeded ${inserted.length} products:`);
    inserted.forEach(p => console.log(`   • [${p.category}] ${p.name} — $${p.price}`));

    await mongoose.disconnect();
    console.log("\n✅ Done. Database disconnected.");
  } catch (err) {
    console.error("❌ Seed Error:", err.message);
    process.exit(1);
  }
}

seed();
