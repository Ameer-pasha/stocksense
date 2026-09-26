<<<<<<< ours
# StockSense — inventory backend

A working Express/Mongoose API for authentication, products, warehouses, receipts, deliveries, internal transfers, adjustments, movement history, alerts, search and dashboard KPIs. This repository is the **backend**; a frontend can consume `/api` through a development-server proxy.

## Start locally

Requires Node.js **20+** and MongoDB **7+ running as a replica set**. Transactions will **not** work with a standalone `mongod`.

```bash
npm ci
cp .env.example .env
# Replace JWT_SECRET in .env with: node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
docker compose up -d --wait   # or point MONGODB_URI at an Atlas replica set
npm run create-admin          # requires ADMIN_EMAIL and ADMIN_PASSWORD in your environment
npm run seed                  # optional: two warehouses + three products/stock balances
npm run dev
curl http://localhost:5000/api/health
```

Set `ADMIN_EMAIL=you@example.com` and `ADMIN_PASSWORD=<strong password>` **in the shell** for `npm run create-admin`. Do not commit passwords. This is the explicit bootstrap path: public signup creates **staff only**, never admin. An admin can change another user's role via `PUT /api/auth/users/:id/role`; role changes revoke the user's old access tokens. Seed data is idempotent, not a source of demo credentials.

To test without Docker, use MongoDB Atlas and set `MONGODB_URI` in `.env`. For a disposable **development-only** database you can use `USE_MEMORY_DB=true npm start` after setting JWT_SECRET and `NODE_ENV=development`; this downloads a MongoDB binary and loses all data on shutdown. In restricted networks that download may be blocked. Neither mode should be used as persistent production storage.

`.env` is ignored by Git. `.env.example` documents configuration: `PORT`, `HOST` (defaults to `0.0.0.0` for previews), `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV`, comma-separated `FRONTEND_URL`, `DEV_RETURN_OTP`, and optional SMTP settings. In development, `DEV_RETURN_OTP=true` returns an OTP **only for an existing account** to facilitate local testing. In production configure `SMTP_HOST` and `SMTP_FROM` (plus `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` as needed); if email is unavailable, password reset fails rather than pretending a message was delivered.

## Quick API smoke test

```bash
# First create an admin using npm run create-admin, then:
curl -s http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"you@example.com","password":"your-admin-password"}'
# Copy data.token, then:
curl http://localhost:5000/api/dashboard/kpis -H 'Authorization: Bearer <TOKEN>'
curl http://localhost:5000/api/stock-ledger -H 'Authorization: Bearer <TOKEN>'
```

See [API documentation](docs/API_DOCUMENTATION.md) for every route, payload, response, roles, filters, the transactional `adjustStock()` contract and teammate integration. [Demo guide](docs/DEMO_GUIDE.md) gives an end-to-end recording checklist. Import [Postman collection](docs/postman_collection.json) and set `baseUrl` and `token` to exercise the API.

## Inventory invariants

- **All quantity changes go through `services/stockService.adjustStock` with an active MongoDB transaction session**, including receipts, deliveries, transfer confirmation/completion/cancellation and manual adjustments. The corresponding ledger entry commits or rolls back with the stock change.
- Quantities are safe nonnegative integers. Deduction uses a conditional atomic `$inc`; insufficient stock returns **409**. Unique indexes guard stock balances per product/warehouse and duplicate ledger movements per document/product/type/location.
- Draft documents do not reserve or change stock. Confirmation/validation rechecks availability. Duplicate state transitions return **409**. Transfers first remove stock at the source, then add it at the destination; cancellation in transit returns it to the source. Counters allocate document numbers transactionally.
- KPI and alert counts represent **tracked, active product–warehouse balances**. An untracked combination has no stock row; explicitly creating a product with `initial_stock: 0` tracks a zero balance and makes it visible in out-of-stock alerts. `reorder_level` is per product.
- Public registration cannot select privileged roles; OTPs are cryptographically generated, stored as hashes, limited to five attempts and ten minutes. Reset tokens are short-lived, purpose-specific, single-use and invalidate old access tokens after a password change.

## Tests

```bash
npm test
# If a MongoDB replica set is already available (avoids downloading mongod):
TEST_MONGO_URI='mongodb://127.0.0.1:27017/stocksense_test?replicaSet=rs0' npm test
```

`tests/unit.test.js` runs without a database. `tests/integration.test.js` exercises auth, CRUD, receipts/deliveries, transfers, rollback, ledger, alerts, KPIs and OTP reset using `mongodb-memory-server`'s replica set (or `TEST_MONGO_URI`). When a MongoDB binary cannot be downloaded and no replica set is supplied, it **reports a skip**, not a passed integration run. CI sets `REQUIRE_DB_TESTS=1` so such a skip becomes a failure. Use a separate disposable database for `TEST_MONGO_URI` because the test creates data.

## Frontend integration

In a frontend dev server proxy `/api` to the backend; browser code calls relative paths, e.g. `fetch('/api/dashboard/kpis', { headers: { Authorization: 'Bearer ' + token } })`. Do **not** call `localhost:5000` from browser code in a remote preview: the browser's localhost is not the sandbox. Configure `FRONTEND_URL` to allow direct cross-origin requests where needed. Store JWTs carefully; prefer a secure storage strategy suitable for the deployment threat model.

> Competition portal selection, collaborator invitations, screenshots and demo recording/submission require access and names from the team; they are **not performed by this codebase**. Only push/commit to the session branch, never to `main` from this workspace.
=======
# stocksense

Modular Inventory Management System for real-time product, warehouse, stock
movement, receipts, deliveries, transfers, and inventory adjustments.

Built for the Odoo x GCET Virtual Round hackathon.

## Repository layout

```
backend/    Node.js + Express + MongoDB API
frontend/   React app (coming from the frontend team)
docs/       API documentation
```

## Backend (current)

```bash
cd backend
npm install
cp .env.example .env      # set MONGODB_URI (local or Atlas)
npm run dev               # API on http://localhost:5000/api
```

| Command | Description |
| ------- | ----------- |
| `npm run dev` | API with auto-reload |
| `npm start` | API in production mode |
| `npm run seed` | load demo data (warehouses, products, stock, a draft transfer) |
| `npm test` | smoke test - 47 assertions, runs fully offline |

Endpoint reference: [`backend/docs/API_DOCUMENTATION.md`](backend/docs/API_DOCUMENTATION.md)
Setup, architecture and integration notes: [`backend/README.md`](backend/README.md)

### Modules

| Module | Owner |
| ------ | ----- |
| Warehouses, Internal Transfers, Stock Ledger, Stock Adjustments, Alerts, Search, Reports | Ameer |
| Auth, Products, Receipts, Deliveries, Dashboard KPIs | Prince |
| Authentication UI, Dashboard, Navigation | Faizan |
| Products UI, Stock Adjustments UI, Alerts UI | Tarun |
>>>>>>> theirs
