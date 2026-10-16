# Smart Shop X - frontend

React 19 + Vite 8. Set `VITE_API_URL` (see `.env.example`), then `npm install && npm run dev`.

- `src/index.css` - design tokens + base components (buttons, forms, badges, tables, modal)
- `src/pages.css` - layout and page styles
- `src/context` - Auth, Cart, Toast providers
- `src/pages` - Home, Shop, ProductDetails, Cart, Checkout, OrderHistory, Login, Admin*

When `VITE_API_URL` is not set, the Vite dev server proxies `/api` and `/uploads`
to the local backend at `http://localhost:5000`. Start the backend before using
the frontend locally.
