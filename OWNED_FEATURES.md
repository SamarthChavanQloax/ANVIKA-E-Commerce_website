# Orders, Checkout, Payments, Reviews, Coupons, and Admin

## Scope and assumptions

- Existing `User`, `Product`, and cookie JWT authentication modules are reused.
- The current backend has no Cart model or cart API. The frontend's existing local cart sends product IDs, quantities, and selected variants to checkout. The server re-reads prices, stock, names, and images from MongoDB.
- `Product.stock` is the only inventory field currently available. Inventory is decremented atomically at product level. Variant-specific inventory requires Piyush's inventory contract to expose variant stock before it can be added safely.
- The existing embedded `Product.reviews` field is preserved. New reviews use the owned `Review` collection and update the existing Product `rating` and `numReviews` fields.
- Razorpay is optional. COD works without credentials; online payment endpoints return a configuration error until Razorpay variables are present.

## API summary

- Orders: `POST /api/orders`, `GET /api/orders`, `GET /api/orders/:id`, `PUT /api/orders/:id/cancel`.
- Checkout validation: `POST /api/orders/checkout/validate`.
- Payments: `POST /api/orders/payments/create`, `/verify`, `/failure`; webhook `POST /api/payments/webhook`; admin refund `POST /api/admin/orders/:orderId/refund`.
- Admin orders: `GET /api/admin/orders`, `PUT /api/admin/orders/:id/status`.
- Reviews: `GET/POST /api/products/:productId/reviews`, `PUT/DELETE /api/reviews/:id`.
- Coupons: public `GET /api/coupons`, authenticated `POST /api/coupons/validate`, admin CRUD under `/api/admin/coupons`.
- Dashboard: `GET /api/admin/dashboard`, `/analytics/revenue`, `/analytics/products`, `/analytics/customers`.

All protected endpoints require the existing HTTP-only `jwt` cookie. Admin endpoints require `req.user.role === 'admin'`.

## Inventory and payment safety

- Prices, discounts, coupon eligibility, shipping, totals, and stock are calculated on the server.
- COD orders atomically decrement stock during order creation.
- Online orders validate stock but decrement only after a valid Razorpay signature.
- Failed/cancelled/returned/refunded orders restore stock once, tracked by `inventoryReduced` and `inventoryReleased`.
- Payment secrets are read only from environment variables and never returned to clients except the public Razorpay key ID.

## Run and test

```powershell
cd backend
npm install
copy .env.example .env
npm run dev

# in a second terminal
cd frontend
npm install
copy .env.example .env
npm run dev
```

For a seeded database:

```powershell
cd backend
npm run data:import
```

The frontend checkout uses COD by default. Configure Razorpay variables and add a Razorpay client widget before exercising online payment success/failure in a browser. API smoke tests should cover authenticated customer order creation/list/detail/cancel, admin status transitions, stock changes, review ownership and purchase restriction, coupon expiry/limits, analytics authorization, and Razorpay signature/webhook rejection.
