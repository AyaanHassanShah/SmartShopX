const Product = require("../models/Product");
const { escapeRegex, isValidId, toList, toSizeList } = require("../utils/helpers");

const SORTS = {
  newest: { createdAt: -1 },
  "price-asc": { price: 1, _id: 1 },
  "price-desc": { price: -1, _id: 1 },
  "name-asc": { name: 1, _id: 1 }
};

// @desc   Products with filtering, sorting and pagination
// @route  GET /api/products
// Query: search, category, color (csv), size (csv), minPrice, maxPrice, inStock, sort, page, limit
const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, size, search, inStock, sort } = req.query;
    const query = {};

    if (category) query.category = new RegExp(`^${escapeRegex(category)}$`, "i");

    const min = minPrice !== undefined && minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : null;
    if (Number.isFinite(min) || Number.isFinite(max)) {
      query.price = {};
      if (Number.isFinite(min)) query.price.$gte = min;
      if (Number.isFinite(max)) query.price.$lte = max;
    }

    const colors = toList(color);
    if (colors.length) {
      query.colors = { $in: colors.map((c) => new RegExp(`^${escapeRegex(c)}$`, "i")) };
    }

    const sizes = toSizeList(size);
    if (sizes.length) {
      const numericSizes = sizes.map(Number).filter(Number.isFinite);
      const sizeMatch = [
        { sizes: { $in: sizes } },
        ...(numericSizes.length ? [{ sizes: { $in: numericSizes } }] : [])
      ];
      query.$and = [{ $or: sizeMatch }];
    }

    if (inStock === "true") query.countInStock = { $gt: 0 };

    if (search && String(search).trim()) {
      const rx = new RegExp(escapeRegex(String(search).trim()), "i");
      query.$and = [...(query.$and || []), { $or: [{ name: rx }, { category: rx }, { description: rx }] }];
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);
    const page = Math.max(parseInt(req.query.page) || 1, 1);

    const [total, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(SORTS[sort] || SORTS.newest)
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    res.json({ products, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Facets used to build the filter sidebar from real data
// @route  GET /api/products/filters
const getFilters = async (req, res) => {
  try {
    const [categories, colorsRaw, sizes, price] = await Promise.all([
      Product.distinct("category"),
      Product.distinct("colors"),
      Product.distinct("sizes"),
      Product.aggregate([
        { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } }
      ])
    ]);

    const colors = [...new Set(colorsRaw.map((c) => c.trim()))].sort();
    res.json({
      categories: categories.sort(),
      colors,
      sizes: sizes.sort((a, b) => {
        const aNumber = Number(a);
        const bNumber = Number(b);
        if (Number.isFinite(aNumber) && Number.isFinite(bNumber)) return aNumber - bNumber;
        if (Number.isFinite(aNumber)) return -1;
        if (Number.isFinite(bNumber)) return 1;
        return a.localeCompare(b);
      }),
      price: { min: Math.floor(price[0]?.min ?? 0), max: Math.ceil(price[0]?.max ?? 0) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Autocomplete
// @route  GET /api/products/search?q=
const searchProducts = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    if (q.length < 2) return res.json([]);

    const products = await Product.find({ name: new RegExp(escapeRegex(q), "i") })
      .select("name image category price")
      .limit(6);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Single product
// @route  GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: "Product not found" });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Validate + normalise a product payload. Returns { error } or { data }.
const parseBody = (body, partial = false) => {
  const data = {};
  const err = (m) => ({ error: m });

  if (body.name !== undefined || !partial) {
    if (!String(body.name || "").trim()) return err("Name is required");
    data.name = String(body.name).trim();
  }
  if (body.description !== undefined || !partial) {
    if (!String(body.description || "").trim()) return err("Description is required");
    data.description = String(body.description).trim();
  }
  if (body.category !== undefined || !partial) {
    if (!String(body.category || "").trim()) return err("Category is required");
    data.category = String(body.category).trim();
  }
  if (body.image !== undefined || !partial) {
    if (!String(body.image || "").trim()) return err("Image is required");
    data.image = String(body.image).trim();
  }
  if (body.price !== undefined || !partial) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) return err("Price must be a positive number");
    data.price = price;
  }
  if (body.countInStock !== undefined || !partial) {
    const stock = Number(body.countInStock);
    if (!Number.isInteger(stock) || stock < 0) return err("Stock must be a whole number (0 or more)");
    data.countInStock = stock;
  }
  if (body.colors !== undefined) data.colors = toList(body.colors);
  if (body.sizes !== undefined) data.sizes = toSizeList(body.sizes);

  return { data };
};

// @route POST /api/products  (admin)
const createProduct = async (req, res) => {
  try {
    const { data, error } = parseBody(req.body);
    if (error) return res.status(400).json({ message: error });
    res.status(201).json(await Product.create(data));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/products/:id  (admin)
// Uses explicit undefined checks, so setting price/stock to 0 now works.
const updateProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: "Product not found" });
    const { data, error } = parseBody(req.body, true);
    if (error) return res.status(400).json({ message: error });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, data);
    res.json(await product.save());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/products/:id  (admin)
const deleteProduct = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return res.status(404).json({ message: "Product not found" });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/products/top  -> latest in-stock arrivals
const getTopProducts = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 4, 12);
    const products = await Product.find({ countInStock: { $gt: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getFilters,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  searchProducts
};
