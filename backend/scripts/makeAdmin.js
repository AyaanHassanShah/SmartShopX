/**
 * Promote an existing user to admin.
 * Usage (from /backend):  npm run make-admin -- user@example.com
 */
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const User = require("../models/User");

(async () => {
  const email = String(process.argv[2] || "").trim().toLowerCase();
  if (!email) {
    console.error("Usage: npm run make-admin -- user@example.com");
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOneAndUpdate({ email }, { isAdmin: true }, { new: true });
    console.log(user ? `${user.email} is now an admin. Sign out and back in.` : `No user with email ${email}. Register first.`);
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
