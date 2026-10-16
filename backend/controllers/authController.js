const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const send = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  token: generateToken(user._id)
});

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2) return res.status(400).json({ message: "Please enter your full name" });
    if (!EMAIL_RX.test(email)) return res.status(400).json({ message: "Please enter a valid email" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json(send(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/auth/login  (same message for unknown email / wrong password: no account enumeration)
const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }
    res.json(send(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/auth/me  -> lets the client re-validate a stored session
const getMe = async (req, res) => {
  res.json({ _id: req.user._id, name: req.user.name, email: req.user.email, isAdmin: req.user.isAdmin });
};

module.exports = { registerUser, loginUser, getMe };
