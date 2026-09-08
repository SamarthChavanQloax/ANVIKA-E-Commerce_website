# MERN E-Commerce Inspection Report

Date: 2026-09-08
Branch: akash
Scope: read-only inspection before fixes

## Architecture

- Backend: Express 5, Mongoose 9, cookie-parser, JWT, bcrypt, Razorpay SDK.
- Frontend: React 19, Vite, React Router, Axios, Tailwind/Vite tooling.
- MongoDB connection is started in `backend/server.js` using `MONGO_URI`, with a localhost fallback.
- Frontend API requests use Axios with `VITE_API_URL` and credentials enabled.
- No service directory exists. Business logic is in controllers and `backend/utils/orderUtils.js`.

## Authentication and Shared Modules

- Authentication uses an HTTP-only `jwt` cookie containing a user ID.
- `protect` loads the user from MongoDB; `admin` checks `role === 'admin'`.
- `User` contains addresses and a Product-reference wishlist.
- Product, Category, User, Order, Payment, Review, and Coupon models exist.
- There is no backend Cart model/API, Address controller/API, or separate Inventory model/API.
- Frontend cart, wishlist, and compare state are browser-local. Checkout sends local cart item IDs to the backend.
- No duplicate User, Product, Category, Address, Cart, Wishlist, or Inventory models were found. Product contains a legacy embedded review schema in addition to the active Review collection.

## Routes

- Products: `GET /api/products`, `GET /api/products/:id`.
- Users: registration, login, logout, and protected profile routes.
- Orders: `POST/GET /api/orders`, `GET /api/orders/:id`, cancellation, checkout validation, and payment paths.
- Admin: orders, status updates, refunds, coupon CRUD, dashboard, and analytics.
- Reviews: public list; protected create, update, and delete.
- Coupons: public active list; protected validation; admin CRUD.
- Payments: Razorpay webhook under `/api/payments/webhook`.
- No category, cart, wishlist, or inventory routes exist.

## Assigned Feature Findings

### Orders and checkout

- Order stores user, product reference, product name/image snapshots, variant, size, color, quantity, shipping address, subtotal, discount, shipping fee, total, payment/order status, coupon/payment references, inventory flags, and timestamps.
- Order status enum includes Pending, Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled, Returned, and Refunded.
- Server re-reads Product records and recalculates prices, stock, coupons, shipping, and totals. Frontend totals are not trusted by order creation.
- COD decrements Product.stock atomically with a conditional `$gte` update before persisting the order, and restores on order creation failure.
- Online orders defer stock reduction until successful Razorpay verification.
- Cancellation and terminal admin statuses restore Product.stock once using inventory flags.
- No transaction/session wraps stock, order, payment, coupon, and cart operations. There is no server-side cart to clear.
- Unsupported payment method strings are accepted as pending non-COD orders, which can create orphaned orders.

### Payments

- Razorpay order creation and client verification exist.
- Verification checks HMAC signature, provider order ID, provider payment ID, amount, currency, and captured status.
- Secrets are read from environment variables; only the public key ID is returned.
- Payment failure marks the order Failed/Cancelled and restores stock if reserved.
- Webhook signature verification exists, but webhook handling only finds an existing Payment by provider payment ID and does not perform deferred inventory reduction.
- Refund endpoint exists under admin order routes.
- Online payment execution is blocked unless Razorpay credentials and a reachable gateway are available.

### Reviews

- Active Review model uses a unique product/user pair, rating, text, and timestamps.
- Review creation requires a qualifying purchased order. Update/delete enforce review ownership.
- Product.rating and Product.numReviews are recalculated from the Review collection.
- Product also has an unused embedded review shape using `comment`, creating a representation mismatch.

### Coupons

- Coupon supports uppercase code, percentage/fixed type, value, minimum order, maximum discount, expiry, usage limit/count, active flag, and timestamps.
- Validation is server-side and checkout ignores client-supplied discount values.
- Coupon usage increment is not transactionally coupled to payment/order state.

### Admin/dashboard

- Admin middleware protects all `/api/admin` routes.
- Dashboard and analytics use MongoDB aggregation/find queries for revenue, orders, customers, products, status counts, low stock, recent orders, best sellers, and time/customer analytics.
- Frontend admin dashboard calls dashboard, admin orders, and status update APIs.
- No hardcoded dashboard numbers were found in the admin page path, but much of the storefront still uses local static product data.

## Integration Risks

1. Frontend local catalog IDs such as `prod_1` are not Mongo ObjectIds, so checkout and reviews cannot use seeded Mongo products through the normal storefront.
2. Product browsing, home carousels, search, and product detail use static frontend product data; the product carousel contains an API TODO.
3. Seeder uses `User.insertMany`, which bypasses save middleware, so seeded plaintext passwords may not authenticate with bcrypt comparison.
4. User save middleware calls `next()` without returning when the password is unchanged, then continues into hashing logic.
5. Frontend exposes Razorpay even when the backend is unconfigured. A failed payment-order creation can leave a pending order created by the initial `POST /api/orders`.
6. Razorpay modal dismissal does not call the payment failure endpoint.
7. Frontend shipping calculation and backend shipping calculation use different bases/threshold behavior.
8. Frontend authentication stores a local user snapshot and does not restore `/users/profile` or clear the server cookie on logout.
9. No backend Cart means checkout cannot verify or clear a persisted cart.
10. No variant-specific stock exists; only aggregate Product.stock is validated and reduced.

## Testing Infrastructure and Environment

- Backend test script: `node --test`; one utility test file exists for coupon/shipping calculations.
- Frontend has build/lint scripts but no test runner or component/integration tests.
- No Jest, Vitest, Supertest, Cypress, or Playwright configuration was found.
- Full API persistence/security testing requires a running MongoDB and configured environment.
- Razorpay success, failure, webhook, and refund tests require valid gateway configuration or a controlled gateway stub; no such test harness exists.
- Required environment variable names are documented in `backend/.env.example` and `frontend/.env.example`; secret values were not inspected or recorded.

## Pre-Fix Status

No code fixes have been applied during this inspection. The next step is focused executable validation from the repository root, followed by only the smallest changes needed for confirmed assigned-feature failures.
