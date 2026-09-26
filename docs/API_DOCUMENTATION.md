# StockSense API — backend contract

**Base URL:** `/api` (default local address `http://localhost:5000/api`). JSON requests/responses. Successful responses include `success: true` and usually `data` (and sometimes `message`/`pagination`); failures include `success: false` and `message`. IDs are MongoDB ObjectIds (24 hex characters); all inventory quantities are nonnegative **integers**. Database fields use `snake_case`; Mongoose's built-in timestamps are `createdAt`/`updatedAt`.

The public routes are `/health`, `/auth/signup`, `/auth/login`, `/auth/forgot-password`, `/auth/verify-otp`, `/auth/reset-password`. **Every other route needs** `Authorization: Bearer <access-token>`. GET endpoints are readable by staff, manager and admin. All inventory writes require manager or admin; `/auth/users` and role changes require admin.

## Authentication

| Method | Path | Body/notes |
| --- | --- | --- |
| POST | `/auth/signup` | `{ "name":"Jane", "email":"jane@example.com", "password":"password123" }` → 201, `{data:{token,user:{id,name,email,role:"staff"}}}`. An explicit role other than staff is rejected (403). |
| POST | `/auth/login` | `{ "email":"jane@example.com", "password":"password123" }` → access `token` + user. Email matching is case insensitive. |
| POST | `/auth/forgot-password` | `{ "email":"jane@example.com" }` → generic message to avoid account enumeration. In development **only**, with `DEV_RETURN_OTP=true`, an existing user additionally gets `{data:{otp,expiry}}`; otherwise email is sent through configured SMTP. No SMTP in production → 503. |
| POST | `/auth/verify-otp` | `{ "email":"jane@example.com", "otp":"123456" }` → `{data:{resetToken}}`. OTP: 10 minutes, 5 attempts, one use. |
| POST | `/auth/reset-password` | `{ "email":"jane@example.com", "newPassword":"newpassword123", "resetToken":"..." }` → 200. Reset tokens expire in 10 minutes, cannot call other APIs and are consumed on use. All existing access tokens are revoked. |
| GET | `/auth/me` | Returns `{data:{user:{id,name,email,role}}}`. |
| GET | `/auth/users` | Admin only; returns users without password/OTP secrets. |
| PUT | `/auth/users/:id/role` | Admin only: `{ "role":"manager" }` (or admin/staff). Old access tokens are invalidated; user logs in again. |

Passwords require 8+ characters. An admin is bootstrapped using `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin`; public signup **cannot** create an admin. Login JWTs expire after 30 days. Set `JWT_SECRET` to a strong random value in `.env` (never commit it).

## Products and warehouses

| Method | Path | Body/notes |
| --- | --- | --- |
| GET | `/products?page=1&limit=50` | Active products, paginated (limit 1–100). |
| POST | `/products` | `{ "name":"Steel Rods", "sku":"STL-001", "category":"Raw Materials", "unit_of_measure":"units", "reorder_level":25, "unit_price":100, "warehouse_id":"...", "initial_stock":100 }`. Last two fields are optional but must appear together. Positive opening stock writes an adjustment ledger entry; zero creates a tracked zero balance. SKU is unique (uppercased). |
| GET | `/products/:id` | Product details (including archived products). |
| GET | `/products/:id/stock` | `{data:[{warehouse_id,warehouse_name,warehouse_location,quantity}]}`. |
| PUT | `/products/:id` | Edit name, sku, category, unit_of_measure, reorder_level, unit_price. |
| DELETE | `/products/:id` | Soft-archive. Refused if positive stock or pending operations. |
| GET | `/warehouses` | Active warehouses + `{id,name,location,manager_id,total_products,total_stock_value,created_at}`; value = sum(quantity × product.unit_price) for tracked records. |
| POST | `/warehouses` | `{ "name":"Main Warehouse", "location":"Mumbai", "manager_id":"..." }`; manager_id optional. Warehouse names unique case-insensitively. |
| GET | `/warehouses/:id` | Warehouse details, including inactive. |
| GET | `/warehouses/:id/stock` | `{warehouse_name,data:[{product_id,product_name,sku,category,quantity,unit,last_updated}]}`. |
| PUT | `/warehouses/:id` | Update name, location, manager_id (null removes manager); `is_active: true` reactivates. |
| DELETE | `/warehouses/:id` | Soft-deactivate if no positive stock or pending operations. |

## Receipts and deliveries

These minimal operation APIs are included so stock/ledger/KPIs can be demonstrated end-to-end without waiting for a second implementation. The user authenticating must be a manager/admin to write.

| Method | Path | Body/notes |
| --- | --- | --- |
| POST | `/receipts` | `{ "supplier_name":"ABC Suppliers", "warehouse_id":"...", "items":[{"product_id":"...","quantity_received":50}], "notes":"optional" }` → draft, auto number `REC-0001`. |
| GET | `/receipts?status=draft&page=1&limit=50` | Paginated list. `GET /receipts/:id` retrieves one. |
| PUT | `/receipts/:id/validate` | Draft → done; adds each item via `adjustStock` and writes receipt ledger rows atomically. |
| PUT | `/receipts/:id/cancel` | Draft → cancelled; no stock changes. |
| POST | `/deliveries` | `{ "customer_name":"Customer A", "warehouse_id":"...", "items":[{"product_id":"...","quantity":10}] }` → draft, `DEL-0001`. |
| GET | `/deliveries?status=draft&page=1&limit=50` | Paginated list. `GET /deliveries/:id` retrieves one. |
| PUT | `/deliveries/:id/validate` | Draft → done; removes stock atomically or 409 if unavailable. |
| PUT | `/deliveries/:id/cancel` | Draft → cancelled; no stock changes. |

Items must contain 1–100 distinct active products, with positive integer quantities. Creating a draft does **not** reserve stock; validating later rechecks availability. Duplicate validation/cancellation of a completed document returns 409.

## Internal transfers

| Method | Path | Body/notes |
| --- | --- | --- |
| POST | `/transfers` | `{ "from_warehouse_id":"...", "to_warehouse_id":"...", "scheduled_date":"2026-10-01", "items":[{"product_id":"...","quantity":20}], "notes":"optional" }` → draft `TRF-0001`. Different active warehouses and available source stock required. |
| GET | `/transfers?status=draft&from_warehouse=&to_warehouse=&start_date=&end_date=&page=1&limit=50` | Filter/paginate; start/end apply to `scheduled_date`. `GET /transfers/:id` gets one. |
| PUT | `/transfers/:id/confirm` | Draft → in_transit. Rechecks stock, writes negative `transfer_out` entries and deducts source stock in one transaction. |
| PUT | `/transfers/:id/complete` | In_transit → done. Adds destination stock, writes positive `transfer_in` entries and sets each `quantity_received`. |
| PUT | `/transfers/:id/cancel` | Draft → cancelled (no movements) or in_transit → cancelled (returns stock to source via `transfer_cancelled` ledger entries). Done/cancelled transfers cannot be cancelled. |

**State diagram:** `draft → in_transit → done`; `draft/in_transit → cancelled`. Each transition is atomic. New transfers validate available stock but **do not reserve it**, so confirmation may return 409 if another operation used the stock meanwhile. Transfers in transit are not counted in either warehouse until completed/cancelled.

## Stock adjustments

| Method | Path | Body/notes |
| --- | --- | --- |
| POST | `/stock-adjustments` | `{ "product_id":"...", "warehouse_id":"...", "counted_quantity":107, "reason":"damaged", "notes":"3 units found damaged" }`. Returns `{data:{adjustment_number,system_quantity,counted_quantity,difference,ledger_entry,...}}` with 201 if changed; 200 and `difference:0` if already correct (no ledger). |
| GET | `/stock-adjustments?product_id=&warehouse_id=&start_date=&end_date=&page=1&limit=50` | Manual adjustments only; populated history with old_stock/new_stock/difference. Opening stock appears instead in the general ledger. |

`reason` is a required nonempty string; e.g. damaged, lost, found, miscount, expired. A manual adjustment has its own reference document and sequential `ADJ-0001` number. Negative counted_quantity is rejected.

## Stock movement ledger

| Method | Path | Body/notes |
| --- | --- | --- |
| GET | `/stock-ledger?product_id=&warehouse_id=&transaction_type=&start_date=&end_date=&page=1&limit=50` | Filtered, formatted newest-first ledger; `pagination:{total,page,pages,limit}`. |
| GET | `/stock-ledger/product/:product_id?warehouse_id=&limit=20` | Raw populated rows for a product. |
| GET | `/stock-ledger/warehouse/:warehouse_id?transaction_type=&start_date=&end_date=&limit=50` | Raw populated rows for a warehouse. |
| GET | `/stock-ledger/summary?start_date=&end_date=&warehouse_id=&product_id=` | By type: `{_id,count,total_quantity_in,total_quantity_out}`. Out totals are positive magnitudes. |

Types: `receipt`, `delivery`, `transfer_out`, `transfer_in`, `adjustment`, `transfer_cancelled`. Dates accept ISO timestamps or `YYYY-MM-DD`. Date-only `end_date` is inclusive **through the end of that UTC day**. Pagination page >= 1, limit 1–100 (default 50). Invalid IDs, dates, filters and limits return 400. Missing referenced product/warehouse/user names are rendered as Unknown/System rather than crashing.

Example ledger row:

```json
{
  "id": "507f1f77bcf86cd799439011",
  "date": "2026-09-26T10:30:00.000Z",
  "product_name": "Steel Rods",
  "sku": "STL-001",
  "warehouse": "Main Warehouse",
  "transaction_type": "receipt",
  "reference": "REC-0001",
  "quantity_change": 50,
  "stock_before": 100,
  "stock_after": 150,
  "performed_by": "Administrator",
  "notes": "Receipt from ABC Suppliers"
}
```

## Dashboard, alerts and search

| Method | Path | Result |
| --- | --- | --- |
| GET | `/dashboard/kpis` | `{total_products,low_stock_items,out_of_stock_items,pending_receipts,pending_deliveries,internal_transfers_scheduled}`. Pending receipts/deliveries = draft; scheduled transfers = draft + in_transit. Active product/warehouse **stock rows** count for low/out-of-stock. |
| GET | `/dashboard/recent-operations?limit=20` | Latest movements (`limit` max 100), with product, warehouse, type, change, reference and actor. |
| GET | `/alerts/low-stock?warehouse_id=` | Tracked balances where `quantity < product.reorder_level`; returns current_stock, reorder_level, shortage, status (low_stock/out_of_stock). |
| GET | `/alerts/out-of-stock?warehouse_id=` | Tracked balances with quantity exactly zero. |
| GET | `/search/products?q=steel&warehouse_id=` | Case-insensitive **literal** name/SKU search, query length 2–80, top 20 active products + total_stock and stock_by_warehouse. |

If a product has **never** had a tracked stock record in a warehouse, it is omitted from out-of-stock/low-stock. Set `initial_stock:0` when creating it or count it in an adjustment to establish a zero balance.

## Member 3 / operation integration — `adjustStock()`

```js
const mongoose = require('mongoose');
const { adjustStock } = require('../services/stockService');

// One transaction must encompass the source document status and ALL its item changes.
await mongoose.connection.transaction(async (session) => {
  const receipt = await Receipt.findById(id).session(session);
  if (!receipt || receipt.status !== 'draft') throw new Error('Invalid receipt state');
  for (const item of receipt.items) {
    await adjustStock({
      product_id: item.product_id,
      warehouse_id: receipt.warehouse_id,
      quantity_change: item.quantity_received, // negative for deliveries/outgoing
      transaction_type: 'receipt',
      reference_id: receipt._id,
      reference_number: receipt.receipt_number,
      performed_by: req.user._id,
      notes: 'Receipt from supplier',
      session
    });
  }
  receipt.status = 'done';
  await receipt.save({ session });
});
```

Parameters `product_id`, `warehouse_id`, signed nonzero integer `quantity_change`, `transaction_type`, `reference_id` (source document ObjectId), nonempty `reference_number` and **active session** are required; `performed_by`/`notes` are optional. Returns `{ stock, ledgerEntry }`. A missing/inactive product or warehouse gives 404; insufficient stock 409. Only adjustments may have either sign; receipt/incoming/cancellation must be positive and delivery/outgoing negative. Do not update `Stock.quantity` or write ledger rows directly. Use a MongoDB **replica set**; a standalone server cannot commit transactions. Helpers `getCurrentStock`, `getProductStockByWarehouse`, `getWarehouseStock` are also exported.

**Member 2 conventions:** `Product` has `name`, `sku`, `unit_of_measure`, `reorder_level`, `unit_price`; `Warehouse` has `name`, `location`, `is_active`. `Stock` has a unique `(product_id, warehouse_id)` key. All IDs are ObjectIds. **Member 4:** send Bearer JWT on private routes and use relative `/api/...` paths from a proxied browser build; add the UI origin to `FRONTEND_URL` if using CORS directly.

## Status/error codes

`200` success, `201` created, `400` invalid payload/filter, `401` missing/invalid/expired token, `403` insufficient role, `404` missing document/route, `409` conflicting state, duplicate unique fields or insufficient stock, `429` auth rate limit, `503` missing reset-email configuration or MongoDB replica-set support, `500` unexpected internal error. Never infer success from the presence of `data`; check `success`/HTTP status.
