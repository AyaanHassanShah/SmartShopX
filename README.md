# Smart Shop X

A full-stack e-commerce store (React + Vite, Express, MongoDB) with a customer storefront and an admin console.

## What changed in this version

**Theme:** new "Aurora" look - deep ink navy, teal primary, amber accents, Sora + Inter type. Every colour, radius and shadow is a CSS variable at the top of `frontend/src/index.css`, so re-theming is a 10-line change.

**Filters now work end to end**
- Filter options (categories, colours, sizes, price range) are loaded from the database (`GET /api/products/filters`), so they always match real stock. Before, colours/sizes were hard-coded and some products (e.g. Navy, Orange) could never be matched.
- Colour and size are multi-select, plus price range, in-stock only, search and sort (newest, price, name).
- Everything lives in the URL (`/shop?category=Shoes&color=Black&size=42&sort=price-asc`), so results can be shared and the back button works.
- Server-side pagination, removal chips, clear-all, mobile filter drawer.
- Fixed: price filter silently hid items over $1000, search regex wasn't escaped, category match was case-sensitive.

**Bugs and loopholes fixed**
- Orders: price, shipping and stock are computed on the server; stock is reserved atomically and restored on cancel; shipping address and payment method are saved (they were ignored before); order lines snapshot name/price/image.
- `payOrder` let any logged-in user pay for any order. Now owner-only; cancelled/paid orders are rejected.
- Order progress bar never matched `Pending`; fixed, with a proper Cancelled state.
- Cart: quantity/stock/option validation, deleted products are cleaned out, the bag count is shown in the header.
- Product update used `||`, so price or stock could never be set to 0. Fixed; colours and sizes can now be edited in admin.
- Auth: input validation, normalised email, generic login error, 8-char minimum password, `/auth/me` session check, auto sign-out on expired token.
- Product page no longer invents fake colours/sizes.
- Route guards on the frontend (customer and admin) in addition to API checks.
- Server: helmet, rate limiting, CORS from env, JSON error handler, 404 handler.
- `seedProducts.js` had a wrong import path and could not run; fixed and made re-runnable.

**UX**: skeleton loaders, toasts, empty states, inline form validation, show-password, free-shipping progress bar, related products, live search suggestions with keyboard support, 3-step checkout, order tabs with cancel/pay, responsive admin with search, status tabs and order details.

## Setup

```bash
# 1. Backend
cd backend
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed                # optional: demo products
npm run dev                 # http://localhost:5000

# 2. Frontend
cd ../frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000
npm install
npm run dev                 # http://localhost:5173
```

Make yourself an admin: register in the app, then `npm run make-admin -- you@example.com` (from `/backend`) and sign in again.

## Notes
- Payment is a **simulated** gateway (no card data collected, nobody is charged). Plug Stripe/PayPal into `orderController.payOrder` for production.
- Never commit `backend/.env`. It is git-ignored now.
