# Comprehensive Full-System Frontend-Backend Integration Plan

> **Role & Responsibility:** Master Integration Architect & Member 3 Operations Lead  
> **Status:** Detailed Plan Complete — Ready for Review & Approval (**No Code Changes Made Yet**)  
> **Target UI:** Desktop SPA ([frontend/index.html](file:///e:/Projects/Odoo/frontend/index.html) + [frontend/app.js](file:///e:/Projects/Odoo/frontend/app.js) + [frontend/styles.css](file:///e:/Projects/Odoo/frontend/styles.css))  
> **Target Backend:** Unified Express Application Server ([backend/server.js](file:///e:/Projects/Odoo/backend/server.js) + [backend/src/app.js](file:///e:/Projects/Odoo/backend/src/app.js)) bridging Member 1 (Auth/Ledger/Mongoose), Member 2 (Catalog/Warehouses), and Member 3 (Operations/Shortage-Gates/Two-Phase-Transfers).

---

## 1. Executive Summary & System Integration Architecture

### 1.1 The Integration Goal
The StockSense codebase contains high-quality implementations across four team members:
1. **Member 1 (Database & Security):** Robust Mongoose schemas, JWT auth with PBKDF2/bcrypt and OTP password recovery, atomic `$inc` stock adjustments with MongoDB replica-set transactions, and an immutable Stock Ledger audit model.
2. **Member 2 (Catalog & Hierarchy):** Multi-level product definitions, hierarchical warehouse-zone-rack-bin storage locations, categories, reorder rules, and FastAPI/Pydantic service contracts.
3. **Member 3 (Inventory Operations):** Battle-tested business logic for Inbound Receipts, Outbound Deliveries with Shortage Prevention gates, Internal Transfers via Two-Phase Commit (`dispatch` $\to$ `complete`), Physical Adjustments with discrepancy math, and an in-memory double-entry audit engine with 6 passing test suites.
4. **Member 4 (Frontend Desktop UI & Analytics):** A 1600+ line desktop window application featuring 9 operational views, 10 modals, Chart.js analytics, sparklines, live alerts, and a Ctrl+K command palette.

Currently, the frontend communicates with shallow in-memory arrays in `backend/src/app.js` on port 5000, while Member 3's audited services run in isolation on port 5003 or inside `member_3/`, and Member 1's routes require a configured MongoDB replica set.

**The Solution:** Unify the entire system into a single high-performance Express server ([backend/server.js](file:///e:/Projects/Odoo/backend/server.js) on port 5000) that:
1. Serves the static desktop frontend directly at `http://localhost:5000/`.
2. Exposes all `/api/*` endpoints unified under one port with zero CORS friction.
3. Bridges Member 3's audited domain engines into the `/api` routes so that user actions in the frontend trigger real business validation, shortage prevention errors (HTTP 400), two-phase transfer state transitions, and double-entry ledger logging.
4. Provides a **Dual-Mode Persistence Architecture**: uses MongoDB with Mongoose when configured, and automatically falls back to Member 3's in-memory engine when MongoDB is offline, guaranteeing 100% demo-ready execution without external setup.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          DESKTOP FRONTEND APPLICATION (PORT 5000)                      │
│                                                                                        │
│   frontend/index.html  │  frontend/styles.css  │  frontend/app.js                      │
│   ├── AppState (Local Reactive Cache, Optimistic UI Updates, Theme Engine)             │
│   ├── apiClient (Auto-detects origin/api, JWT auth, Error Telemetry & Shortage Toasts) │
│   └── 9 Core UI Tabs & 10 Interactive Modals                                           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / JSON (RESTful)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        UNIFIED BACKEND SERVER (backend/server.js)                      │
│                                                                                        │
│   backend/src/app.js (Port 5000)                                                       │
│   ├── Static Asset Delivery (Serves frontend/ and public/)                             │
│   ├── Global Permissive CORS & JSON Parser (10MB payload support)                      │
│   ├── Unified Route Handlers (/api/auth, /api/products, /api/warehouses, etc.)        │
│   └── member3Bridge.js (Operations Adapter & Business Rules Enforcement)               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                       DATA PERSISTENCE & STORAGE TIER (DUAL-MODE)                      │
│                                                                                        │
│   MODE A: MongoDB + Mongoose (When Online)     MODE B: In-Memory Engine (When Standalone)│
│   ├── models/StockLedger.js (Double-Entry)    ├── member_3/store/operationsStore.js    │
│   ├── models/Stock.js (Warehouse Balances)    ├── member_3/receipts/receiptService.js  │
│   ├── models/Product.js & Warehouse.js        ├── member_3/deliveries/deliveryService.js│
│   └── models/Receipt, Delivery, Transfer, Adj ├── member_3/transfers/transferService.js│
│                                               └── member_3/adjustments/adjustmentService.js
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. File-by-File Codebase Inventory & Frontend Integration Blueprint

Below is an exhaustive analysis of **every single file in the repository**, detailing its exact role, exposed interfaces, the gap with the current frontend, and the precise integration plan.

### 2.1 Group A: Frontend Desktop Client Files

#### 1. `frontend/index.html` (1,636 lines, 81.5 KB)
- **Role:** Complete desktop single-page application structure. Contains top title bar with warehouse scope filter, API connection status badge, 9 navigation tabs (`dashboard`, `products`, `warehouses`, `receipts`, `deliveries`, `transfers`, `adjustments`, `history`, `insights`), search command bar (Ctrl+K), quick-add dropdown, notifications bell, and all 10 modal dialogs.
- **Key Element IDs:**
  - Nav Tabs: `data-view="dashboard"`, `data-view="products"`, etc.
  - Modals: `addProductModal`, `newReceiptModal`, `newDeliveryModal`, `newTransferModal`, `newAdjustmentModal`, `productDetailModal`, `categoryManagerModal`, `authModal`, `mobilePreviewModal`, `commandPaletteModal`.
  - Auth Subscreens: `authScreen-splash`, `authScreen-login`, `authScreen-signup`, `authScreen-forgot`, `authScreen-otp`, `authScreen-reset`.
  - Notification Container: `notifListContainer`, `notifBadgeCount`, `toastContainer`.
- **Integration Plan:**
  - Keep all HTML structure and IDs 100% intact to prevent DOM query breakages.
  - Verify that modal forms (`productForm`, `loginEmail`, `loginPassword`, etc.) correctly map to backend request payloads.
  - Ensure the API Status Badge (`#apiStatusBadge`) reflects live backend connectivity and allows one-click re-syncing.

#### 2. `frontend/app.js` (2,154 lines, 74.3 KB)
- **Role:** Frontend state engine, rendering pipeline, event handlers, and REST client.
- **Key Modules & Classes:**
  - `AppState` (lines 350–430): Manages `products`, `warehouses`, `categories`, `receipts`, `deliveries`, `transfers`, `adjustments`, `history`, `notifications`, `currentWarehouse`, and `theme`.
  - `apiClient` (lines 435–532): HTTP fetch wrapper communicating with `API_BASE_URL`. Performs silent health-checks and `syncFromBackend()`.
  - Action Handlers: `saveProduct`, `deleteProduct`, `createReceipt`, `validateReceiptDirect`, `createDelivery`, `validateDeliveryDirect`, `createTransfer`, `completeTransferDirect`, `createAdjustment`, `addCategory`, `deleteCategory`.
  - Auth Handlers: `handleAuthLogin`, `handleAuthSignup`, `handleAuthForgot`, `handleAuthReset`.
  - Analytics & Charts: `initCharts`, `stockTrendsChart`, `inventoryDonutChart`, `burnRateChart`.
- **Integration Plan:**
  - **Dynamic Base URL Auto-Detection:** Update `API_BASE_URL` so that when loaded from `http://localhost:5000/`, it defaults to `window.location.origin + '/api'`, eliminating manual IP/port overrides.
  - **Error Telemetry & Shortage Alerts:** Enhance `apiClient.request()` to parse HTTP 400 responses (especially Member 3 shortage messages) and trigger red toast alerts (`showToast(errorMsg, 'danger')`).
  - **Auth Integration:** Wire `handleAuthLogin` and `handleAuthSignup` to `/api/auth/login` and `/api/auth/signup`, store JWT token in `localStorage.setItem('stocksense_token')`, and inject into subsequent `apiClient` headers.
  - **Bidirectional State Sync:** Ensure `validateReceiptDirect`, `validateDeliveryDirect`, `completeTransferDirect`, and `createAdjustment` update local state from authoritative server responses and re-render views.

#### 3. `frontend/styles.css` (1,048 lines, 33.3 KB)
- **Role:** Design tokens, CSS variables, dark/light theme definitions, window titlebar styling, table layouts, badges, modal backdrops, and mobile device frames.
- **Integration Plan:**
  - Preserved in full. Add utility classes for danger toasts (`.toast-danger`) and error callouts if needed for shortage notifications.

---

### 2.2 Group B: Server Core & Configuration Files

#### 4. `backend/server.js` (31 lines, 1.1 KB)
- **Role:** Main executable entry point for the backend server (`npm start` or `node backend/server.js`).
- **Current Logic:** Calls `connectDB()` from `src/config/db.js` and listens on `process.env.PORT || 5000`.
- **Integration Plan:**
  - Ensure it starts cleanly on port 5000.
  - Gracefully log startup URLs:
    - Frontend UI: `http://localhost:5000/`
    - Backend API: `http://localhost:5000/api`
    - Health Check: `http://localhost:5000/api/health`

#### 5. `backend/src/app.js` (737 lines, 21.5 KB)
- **Role:** Express application definition, static file serving, middleware, and route mounting.
- **Current State:** Serves `frontend/` static assets, but uses basic in-memory arrays for receipts, deliveries, transfers, and adjustments without shortage validation or two-phase transfers.
- **Integration Plan:**
  - Refactor to mount Member 3's verified domain logic via `backend/src/services/member3Bridge.js`.
  - Mount Member 1's Authentication router (`/api/auth`) with permissive fallback.
  - Ensure all routes (`/api/products`, `/api/warehouses`, `/api/categories`, `/api/receipts`, `/api/deliveries`, `/api/transfers`, `/api/adjustments`, `/api/history`, `/api/alerts`, `/api/dashboard`) return standardized `{ success: true, data: [...] }` envelopes matching `frontend/app.js` expectations.

#### 6. `backend/src/config/db.js` (20 lines, 0.7 KB)
- **Role:** Mongoose database connector with graceful fallback.
- **Current Logic:** Attempts to connect to `process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocksense'` with a 2.5s timeout. If unavailable, logs a warning and falls back to in-memory mode without crashing.
- **Integration Plan:**
  - Keep this excellent fallback pattern. Expose a boolean helper `isMongoConnected()` so the API bridge knows whether to write to Mongoose or the in-memory engine.

#### 7. `server.js` & `app.js` (Root directory, 40 lines & 46 lines)
- **Role:** Alternative server entry points authored by Member 1 for Docker / standalone Mongoose microservice testing.
- **Integration Plan:**
  - Preserve as-is for Member 1 test compatibility. Ensure root `npm test` continues to run unit tests without conflict.

---

### 2.3 Group C: Member 3 Inventory Operations Engine

#### 8. `member_3/store/operationsStore.js` (195 lines, 5.9 KB)
- **Role:** High-fidelity in-memory state engine tracking location-level product stocks, initial operational records, and an append-only double-entry stock ledger.
- **Methods:**
  - `getProduct(productId)`
  - `getLocationStock(productId, locationCode)`
  - `updateLocationStock(productId, locationCode, newQuantity)`
  - `recordLedgerEntry({ documentType, documentRef, productId, sku, productName, sourceLocation, destLocation, quantityChange, unit, reason, performedBy })`
  - `getLedger()`
- **Integration Plan:**
  - Serves as the primary operational state engine when running in standalone mode or in tandem with MongoDB.
  - Ensure product IDs match both `PRD-000101` (frontend seed format) and `prod-001` (test seed format) so data flows effortlessly.

#### 9. `member_3/receipts/receiptService.js` (169 lines, 5.5 KB)
- **Role:** Handles inbound supplier purchase receipts, validation, and stock increments.
- **Methods:**
  - `getAll({ status, warehouseId })`: Returns filtered receipts.
  - `getById(receiptId)`: Retrieves receipt by ID or number.
  - `create({ supplierName, warehouseId, locationCode, receiptDate, notes, items })`: Generates `REC-YYYY-XXX` sequence.
  - `validate(receiptId)`: Atomically increments warehouse location stock for each item, emits `RECEIPT` (+qty) double-entry ledger record, and marks status as `done`.
  - `cancel(receiptId)`: Cancels draft receipt.
- **Integration Plan:**
  - Directly maps to frontend "Inbound Receipts" tab and `createReceipt()`, `validateReceiptDirect()` functions.

#### 10. `member_3/deliveries/deliveryService.js` (229 lines, 7.6 KB)
- **Role:** Manages customer sales dispatches, **shortage prevention audits**, and stock decrements.
- **Methods:**
  - `getAll({ status, warehouseId })`
  - `getById(deliveryId)`
  - `create({ customerName, warehouseId, locationCode, deliveryDate, notes, items })`: Generates `DEL-YYYY-XXX` sequence.
  - `checkAvailability(deliveryId)`: Audits physical stock vs requested items.
  - `updateStatus(deliveryId, newStatus)`: Supports `draft` $\to$ `picking` $\to$ `packing` $\to$ `ready`.
  - `validate(deliveryId)`: **Enforces Shortage Prevention Gate**. If any item requested exceeds location stock, throws an error detailing the exact shortage. If valid, decrements stock, records `DELIVERY` (-qty) in ledger, and marks status as `done`.
- **Integration Plan:**
  - Directly maps to frontend "Delivery Orders" tab and `createDelivery()`, `validateDeliveryDirect()`.
  - Shortage errors trigger HTTP 400, which the frontend displays as a red toast alert.

#### 11. `member_3/transfers/transferService.js` (241 lines, 8.5 KB)
- **Role:** Executes inter-warehouse and intra-warehouse stock transfers using a **Two-Phase Commit Protocol**.
- **Methods:**
  - `create({ sourceWarehouseId, sourceLocationCode, destWarehouseId, destLocationCode, scheduledDate, items })`: Generates `TRF-YYYY-XXX` sequence in `draft`.
  - `confirmDispatch(transferId)` (**Phase 1**): Checks origin availability, decrements origin stock, logs `INTERNAL_TRANSFER_OUT` (-qty), moves status to `in_transit`.
  - `completeArrival(transferId)` (**Phase 2**): Increments destination stock, logs `INTERNAL_TRANSFER_IN` (+qty), moves status to `done`.
  - `cancel(transferId)`: Voids transfer (only allowed in `draft`).
- **Integration Plan:**
  - Directly maps to frontend "Transfers" tab and `createTransfer()`, `completeTransferDirect()`.

#### 12. `member_3/adjustments/adjustmentService.js` (128 lines, 4.3 KB)
- **Role:** Reconciles physical counts against system recorded quantities, enforces standardized reason codes (`damaged`, `lost`, `found`, `miscount`, `expired`, `theft`, `audit`), updates physical stock, and logs double-entry ledger entries.
- **Methods:**
  - `getAll({ warehouse_id, product_id, reason })`
  - `getById(adjustmentId)`
  - `create({ productId, warehouseId, locationCode, countedQuantity, reason, remarks, auditedBy })`: Computes `discrepancy = counted - system`, updates inventory, and logs `ADJUSTMENT`.
- **Integration Plan:**
  - Directly maps to frontend "Adjustments" tab and `createAdjustment()`.

#### 13. `member_3/receipts/receiptRoutes.js`, `deliveryRoutes.js`, `transferRoutes.js`, `adjustmentRoutes.js`, `member_3/backend/operationsRouter.js`
- **Role:** Express route controllers providing REST access to Member 3 services.
- **Integration Plan:**
  - Mounted into the unified Express server under `/api/receipts`, `/api/deliveries`, `/api/transfers`, `/api/adjustments`, and `/api/stock-adjustments`.

#### 14. `member_3/tests/` (6 Test Suites)
- **Files:** `receipts.test.js`, `deliveries.test.js`, `transfers.test.js`, `adjustments.test.js`, `canonicalFlow.test.js`, `apiEndpoints.test.js`.
- **Status:** All 6 suites pass with 100% success.
- **Integration Plan:**
  - Preserved as regression tests to ensure operations logic remains pristine during frontend integration.

---

### 2.4 Group D: Mongoose Data Models (`models/`)

#### 15. `models/Product.js` (14 lines, 611 B)
- **Fields:** `name`, `sku` (uppercase, unique), `category`, `unit_of_measure`, `reorder_level`, `unit_price`, `is_active`.
- **Integration Plan:** Exposes product catalog items to frontend `/api/products`. When syncing with frontend, maps `reorder_level` $\leftrightarrow$ `minStock`, `unit_price` $\leftrightarrow$ `price`.

#### 16. `models/Warehouse.js` (12 lines, 524 B)
- **Fields:** `name` (unique), `location`, `manager_id`, `is_active`.
- **Integration Plan:** Exposes facilities to frontend `/api/warehouses`. Maps to frontend warehouse cards and scope selector.

#### 17. `models/Stock.js` (15 lines, 642 B)
- **Fields:** `product_id`, `warehouse_id`, `quantity` (safe integer $\ge 0$).
- **Integration Plan:** Tracks per-warehouse inventory. Feeds into frontend product stock counts and alerts.

#### 18. `models/StockLedger.js` (31 lines, 1.5 KB)
- **Fields:** `product_id`, `warehouse_id`, `transaction_type` (`receipt`, `delivery`, `transfer_out`, `transfer_in`, `adjustment`, `transfer_cancelled`), `reference_id`, `reference_number`, `quantity_change`, `stock_before`, `stock_after`, `performed_by`, `notes`.
- **Integration Plan:** Exposes double-entry ledger stream to frontend `/api/history` and `/api/ledger` views.

#### 19. `models/Receipt.js`, `Delivery.js`, `InternalTransfer.js`, `StockAdjustment.js`
- **Role:** Persistent document schemas for physical inventory transactions.
- **Integration Plan:** Used for MongoDB storage when connected.

#### 20. `models/User.js` (54 lines, 1.8 KB)
- **Fields:** `name`, `email`, `password` (bcrypt), `role` (`admin`, `manager`, `staff`), `token_version`, `otp_hash`, `otp_expiry`, `reset_token_hash`.
- **Integration Plan:** Powers authentication for `/api/auth/login`, `/api/auth/signup`, and password recovery.

#### 21. `models/Counter.js` (8 lines, 229 B)
- **Role:** Sequence generator for reference codes (`REC-XXXX`, `DEL-XXXX`, etc.).
- **Integration Plan:** Maintains sequential numbering across operations.

---

### 2.5 Group E: Express Routes & Business Controllers (`routes/` & `services/`)

#### 22. `routes/auth.js` (143 lines, 7.6 KB)
- **Endpoints:**
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/verify-otp`
  - `POST /api/auth/reset-password`
  - `GET /api/auth/me`
- **Integration Plan:**
  - Mount directly in `backend/src/app.js`.
  - Connect to frontend `authModal` subscreens.
  - In demo mode, provide quick login presets for demo users.

#### 23. `routes/products.js`, `warehouses.js`, `alerts.js`, `dashboard.js`, `search.js`
- **Role:** Read/write handlers for catalog, KPIs, alerts, and search.
- **Integration Plan:**
  - Wire into unified `backend/src/app.js` with fallback support so queries succeed whether MongoDB is connected or running in in-memory mode.

#### 24. `services/stockService.js` (97 lines, 4.4 KB)
- **Role:** Atomic stock mutator enforcing MongoDB transactions.
- **Integration Plan:** When MongoDB is active, `member3Bridge.js` delegates persistent stock increments/decrements to `stockService.adjustStock()`. When in memory, it delegates to `operationsStore`.

#### 25. `services/counterService.js`, `operationUtils.js`, `middleware/auth.js`, `utils/errors.js`, `utils/validation.js`
- **Role:** Helper utilities for reference numbering, entity validation, JWT authorization, and error formatting.
- **Integration Plan:** Preserved and utilized across unified endpoints.

---

### 2.6 Group F: Member 2 Python Services (`backend/main.py` & `backend/modules/`)

#### 26. `backend/main.py` (211 lines, 10.2 KB)
- **Role:** FastAPI application on port 8000 authored by Member 2 providing Python-based Product, Warehouse, Category, Location, and Reorder Rule endpoints.
- **Integration Plan:**
  - Member 2's data structures and location schemas are fully mirrored in Node.js within `member_3/store/operationsStore.js` and `backend/src/app.js`.
  - For full-stack evaluation, the Node.js unified server remains the primary host for the frontend, while proxy endpoints can forward to port 8000 if Python services are running concurrently.

---

## 3. Complete Screen-by-Screen UI-to-API Interaction Matrix (Screens 1 to 25)

The table below maps every view, modal, button, and user interaction in the StockSense frontend to its backend API endpoint, request schema, service action, and UI response:

| Screen # & Name | Triggering UI Element | Frontend JS Function | HTTP Method & Route | Request Payload Schema | Backend Service / Bridge Action | UI State Mutation & DOM Update | Error State & Handling |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **#1 Splash Screen** | Launch / App Load | `DOMContentLoaded` | `GET /api/health` | _None_ | Checks DB / in-memory status | Updates `#apiStatusBadge` to "Connected" | Badges "Offline (Local)" |
| **#2 Login Modal** | "Sign In" button submit | `handleAuthLogin(e)` | `POST /api/auth/login` | `{ email, password }` | Authenticates user via `User.comparePassword` | Saves JWT token to `localStorage`, shows welcome toast | 401: "Invalid credentials" toast |
| **#3 Sign Up Modal** | "Sign Up" button submit | `handleAuthSignup(e)` | `POST /api/auth/signup` | `{ name, email, password }` | Creates user record (`role: 'staff'`) | Saves token, logs user in, closes modal | 400: Password length / email error |
| **#4 Forgot Password** | "Send Code" submit | `handleAuthForgot(e)` | `POST /api/auth/forgot-password` | `{ email }` | Generates 6-digit OTP, stores hash/expiry | Navigates to Screen #5 (OTP input) | 404/503: Mail failure notice |
| **#5 OTP Verification** | "Verify & Continue" click | `openAuthScreen('reset')` | `POST /api/auth/verify-otp` | `{ email, otp }` | Verifies hash, returns short-lived reset token | Opens Screen #6 (Set New Password) | 400: "Invalid or expired OTP" |
| **#6 Reset Password** | "Reset Password Now" submit | `handleAuthReset(e)` | `POST /api/auth/reset-password` | `{ email, newPassword, resetToken }` | Hashes new password, clears reset token | Shows success toast, returns to Login | 400: Password requirements unmet |
| **#7 Executive Dashboard** | "Dashboard" tab click | `navigateTo('dashboard')` | `GET /api/dashboard` | _None_ | Computes totalStock, lowStock, valuation | Renders KPI cards, Chart.js trends & donut | Falls back to cached `state` |
| **#8 Product Catalog** | "Products" tab click | `navigateTo('products')` | `GET /api/products` | `?warehouse=&category=&search=` | Filters active SKUs by scope | Renders product table rows and badges | Displays empty search state |
| **#8 Quick SKU Filter** | Category/Warehouse dropdown | `filterProducts()` | `GET /api/products` | Query params | Dynamic list filter | Re-renders `#productsTableBody` | Shows "No products found" |
| **#9 Add Product Modal** | "Add Product" form submit | `saveProduct(e)` (create) | `POST /api/products` | `{ name, sku, category, warehouse, stock, minStock, price, cost }` | Creates SKU, logs `PRODUCT_CREATED` in ledger | Prepend `state.products`, close modal, toast | 400: SKU required / duplicate SKU |
| **#9 Edit Product Modal** | "Edit" button submit | `saveProduct(e)` (edit) | `PUT /api/products/:id` | `{ name, sku, category, stock, minStock, price, cost }` | Updates product attributes in store/DB | Updates `state.products`, refreshes table | 404: Product not found |
| **#9 Delete Product SKU** | "Delete" icon click | `deleteProduct(id)` | `DELETE /api/products/:id` | _None_ | Soft deletes product (checks 0 stock) | Removes SKU from table, success toast | 409: "Cannot delete product with stock" |
| **#9 SKU Detail View** | Product row click | `openProductDetail(id)` | `GET /api/products/:id` & `/history` | _None_ | Fetches product info & recent movements | Renders SKU detail modal with movement log | Closes on ESC |
| **#10 Category View** | Category pills / filter | `filterByCategory(c)` | `GET /api/categories` | _None_ | Returns categories, SKU count, and value | Filters product grid by selected category | Graceful empty fallback |
| **#11 Category Manager** | "+ Add Category" submit | `addCategory(e)` | `POST /api/categories` | `{ name }` | Registers new category | Appends to list, updates selects | 400: "Category name required" |
| **#11 Delete Category** | "✕" remove category | `deleteCategory(id)` | `DELETE /api/categories/:id` | _None_ | Removes category entry | Removes from `state.categories` | Shows deletion toast |
| **#12 Warehouses View** | "Warehouses" tab click | `navigateTo('warehouses')` | `GET /api/warehouses` | _None_ | Aggregates capacity, manager, SKU counts | Renders facility cards & zone badges | Uses cached `state.warehouses` |
| **#13 Inbound Receipts** | "Receipts" tab click | `navigateTo('receipts')` | `GET /api/receipts` | `?status=&warehouseId=` | Retrieves PO intake list | Renders receipts table with status tags | Shows empty state |
| **#14 New Receipt Modal** | "Save as Draft" click | `createReceipt(e, 'Draft')` | `POST /api/receipts` | `{ supplier, warehouse, date, items: [...] }` | Member 3 `receiptService.create()` | Prepends draft receipt, updates badge | 400: Missing supplier or items |
| **#14 Direct PO Intake** | "Receive Now" submit | `createReceipt(e)` | `POST /api/receipts` & `validate` | `{ supplier, warehouse, date, items: [...] }` | Creates receipt, increments stock, logs ledger | Increments physical stock, logs `RECEIPT` | 400: Invalid quantity |
| **#14 Validate Receipt** | "Receive Now" row button | `validateReceiptDirect(id)` | `PUT /api/receipts/:id/validate` | _None_ | Member 3 `receiptService.validate(id)` | Stock added to warehouse, status $\to$ Done | 409: "Already validated" |
| **#15 Delivery Orders** | "Delivery Orders" tab | `navigateTo('deliveries')` | `GET /api/deliveries` | `?status=&warehouseId=` | Retrieves customer dispatch list | Renders delivery orders table | Shows empty state |
| **#16 New Delivery Modal** | "Save Delivery" submit | `createDelivery(e)` | `POST /api/deliveries` | `{ customer, warehouse, date, items: [...] }` | Member 3 `deliveryService.create()` | Prepends delivery order to state | 400: Missing customer or items |
| **#16 Direct Dispatch** | "Ship & Fulfill" submit | `validateDeliveryDirect(id)` | `PUT /api/deliveries/:id/validate` | _None_ | **Shortage Prevention Gate**: verifies stock | Decrements stock, logs `DELIVERY` in ledger | **400 Shortage Error Toast** |
| **#17 Internal Transfers** | "Transfers" tab click | `navigateTo('transfers')` | `GET /api/transfers` | `?status=` | Returns internal transfers | Renders transfers table with status pills | Shows empty state |
| **#18 New Transfer Modal** | "Schedule Transfer" submit | `createTransfer(e)` | `POST /api/transfers` | `{ source, dest, product, productId, qty, reason }` | Member 3 `transferService.create()` | Creates transfer, deducts origin (Phase 1) | 400: Same source & destination |
| **#18 Complete Transfer** | "Complete Arrival" button | `completeTransferDirect(id)` | `PUT /api/transfers/:id/complete` | _None_ | Member 3 `transferService.completeArrival()` | Credits destination stock, status $\to$ Completed | 400: Not in-transit |
| **#19 Stock Adjustments** | "Adjustments" tab click | `navigateTo('adjustments')` | `GET /api/adjustments` | `?warehouse=&reason=` | Returns cycle count audit history | Renders adjustments audit table | Shows empty state |
| **#20 Cycle Count Modal** | "Record Count" submit | `createAdjustment(e)` | `POST /api/adjustments` | `{ productId, realStock, reason, auditor }` | Computes delta, updates stock, logs ledger | Reconciles stock, adds audit entry | 404: Product not found |
| **#21 Audit History** | "Stock History" tab click | `navigateTo('history')` | `GET /api/history` | `?product_id=&warehouse_id=` | Fetches double-entry Stock Ledger stream | Renders chronological audit log table | Uses cached `state.history` |
| **#22 CSV Ledger Export** | "Export CSV" click | `exportAuditLedgerCSV()` | _Client-side / API stream_ | _None_ | Formats ledger records into CSV | Triggers browser download of `.csv` | Shows download toast |
| **#23 Alerts Center** | Notification bell click | `renderNotifications()` | `GET /api/alerts` | _None_ | Scans zero-stock & low-stock thresholds | Updates bell badge count & dropdown | Clears notifications |
| **#24 Reorder Quick-Fill** | "Reorder Now" alert click | `openReorderModal(sku)` | Direct Modal pre-fill | _None_ | Pre-selects product and $2\times$ minStock in receipt modal | Opens `#newReceiptModal` with vendor & items | Toast notification |
| **#25 Mobile Companion** | "Mobile Companion" button | `openModal('mobilePreviewModal')`| _Client-side layout preview_| _None_ | Renders compact scanner view | Visual mobile simulator | Closes on ESC |

---

## 4. Member 3 Operational Engines Integration & Bridge Specification

### 4.1 Bridge Architecture (`backend/src/services/member3Bridge.js`)
To seamlessly connect frontend requests to Member 3's audited services without rewriting existing code, a dedicated bridge module will be created:

```javascript
// backend/src/services/member3Bridge.js
const { receiptService } = require('../../../member_3/receipts/receiptService');
const { deliveryService } = require('../../../member_3/deliveries/deliveryService');
const { transferService } = require('../../../member_3/transfers/transferService');
const { adjustmentService } = require('../../../member_3/adjustments/adjustmentService');
const { operationsStore } = require('../../../member_3/store/operationsStore');

module.exports = {
  receiptService,
  deliveryService,
  transferService,
  adjustmentService,
  operationsStore
};
```

### 4.2 Payload Normalization & Compatibility Handling
The frontend sends both Odoo-style names (`supplier`, `warehouse`, `qty`) and Member 1/3 names (`supplier_name`, `warehouse_id`, `quantity`). The bridge normalizes incoming payloads:
- **Receipts:** Accepts both `supplier` and `supplier_name`, `warehouse` and `warehouse_id`, `qty` and `quantity_received`.
- **Deliveries:** Accepts both `customer` and `customer_name`, `warehouse` and `warehouse_id`, `itemsDispatched` and `items`.
- **Transfers:** Accepts both `source`/`fromWarehouseId` and `dest`/`toWarehouseId`.
- **Adjustments:** Accepts both `realStock` and `countedQuantity`, auto-calculating `delta`.

### 4.3 Shortage Prevention Enforcement (HTTP 400)
When a delivery is requested for more stock than exists:
1. `deliveryService.validate(deliveryId)` evaluates available location stock.
2. If available < requested, it throws: `Error: Cannot dispatch delivery due to insufficient stock in WH-MAIN: Solar Inverter V3 (Short by 10 units)`.
3. The Express route catches this and responds:
   ```json
   {
     "success": false,
     "error": "Insufficient stock in WH-MAIN: Solar Inverter V3 (Short by 10 units)",
     "shortage": true
   }
   ```
4. `apiClient` in `frontend/app.js` catches the 400 status and shows a red toast:
   `showToast("⚠️ Delivery Blocked: Insufficient stock in WH-MAIN: Solar Inverter V3 (Short by 10 units)", "danger")`.

---

## 5. Frontend API Client & State Engine Upgrades (`frontend/app.js`)

### 5.1 Dynamic Base URL Detection
Currently, line 435 of `frontend/app.js` hardcodes:
```javascript
const API_BASE_URL = localStorage.getItem('stocksense_api_url') || 'http://localhost:5000/api';
```
Enhancement:
```javascript
const getApiBaseUrl = () => {
  if (localStorage.getItem('stocksense_api_url')) return localStorage.getItem('stocksense_api_url');
  if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:5000/api';
};
```
This ensures zero-configuration connectivity when served from port 5000, 5003, or any custom port.

### 5.2 Error Telemetry & Toast Handling
Currently, if `res.ok` is false, `apiClient.request()` merely returns `null`.
Enhancement:
```javascript
if (!res.ok) {
  const errData = await res.json().catch(() => ({}));
  const msg = errData.error || errData.message || `Request failed with status ${res.status}`;
  console.warn(`[StockSense API Error] ${endpoint}:`, msg);
  showToast(msg, 'danger');
  return { error: msg, status: res.status };
}
```
This guarantees immediate user visibility for business rule violations (such as shortage prevention).

### 5.3 Authentication Token Management
- Automatically read `localStorage.getItem('stocksense_token')`.
- Attach `Authorization: Bearer <token>` to all HTTP requests.
- Provide a persistent user profile in the UI header (`#userProfileBadge`).

---

## 6. Phased Implementation Roadmap & Test Verification

### Phase 1: Unified Server Core & Static Asset Delivery
- **Goal:** Server starts on port 5000, serves `frontend/index.html`, and responds to `/api/health`.
- **Target Files:** `backend/src/app.js`, `backend/server.js`.
- **Test File:** `tests/integration/serverDelivery.test.js`.
- **Verification:** `node tests/integration/serverDelivery.test.js` exits 0.

### Phase 2: Operations Bridge & Business Rules Enforcement
- **Goal:** Bridge Member 3's real services into `backend/src/app.js` for Receipts, Deliveries, Transfers, and Adjustments.
- **Target Files:** `backend/src/services/member3Bridge.js`, `backend/src/app.js`.
- **Test File:** `tests/integration/operationsBridge.test.js`.
- **Verification:** Test verifies receipt stock addition, shortage prevention blocking, two-phase transfer state, and adjustment ledger logging.

### Phase 3: Frontend API Client Enhancement & Telemetry
- **Goal:** Update `frontend/app.js` to auto-detect base URL, handle shortage errors via toasts, and synchronize state.
- **Target Files:** `frontend/app.js:435-555`.
- **Verification:** Browser manual check + automated mock client tests.

### Phase 4: Catalog & Location Stock Synchronization
- **Goal:** Ensure product available counts and warehouse breakdowns update in real time across views.
- **Target Files:** `backend/src/app.js`, `frontend/app.js`.
- **Test File:** `tests/integration/catalogSync.test.js`.
- **Verification:** Assert that movement in WH-MAIN updates product stock cards and detail modals.

### Phase 5: Authentication & User Session Wiring
- **Goal:** Wire login, signup, and demo user switching into `authModal`.
- **Target Files:** `frontend/app.js`, `backend/src/app.js`.
- **Verification:** Test login returns JWT, saves to localStorage, and attributes ledger entries.

### Phase 6: Canonical 4-Step Golden Flow E2E Verification
- **Goal:** Validate the complete 4-step workflow from `StockSense.pdf`:
  1. Receipt +100 kg Steel into Main Store.
  2. Transfer 60 kg Steel from Main Store to Production Rack (Phase 1 & 2).
  3. Delivery 20 kg finished goods from Production Floor (Shortage gate verified).
  4. Adjustment 3 kg damaged steel reconciled.
  5. Audit Ledger confirms exact 77 kg balance.
- **Test File:** `tests/integration/e2eGoldenFlow.test.js`.
- **Verification:** 100% automated assertion pass.

---

## 7. Risk Analysis & Fallback Mechanisms

1. **MongoDB Standalone vs Replica Set:**
   - *Risk:* Member 1's `mongoose.connection.transaction()` throws if MongoDB is not running in replica set mode.
   - *Mitigation:* The dual-mode architecture detects if transactions are supported; if not, it gracefully performs atomic document updates or delegates to the in-memory engine, avoiding transaction abort errors.
2. **Offline Grading / Zero-Dependency Mode:**
   - *Risk:* Evaluator runs `node backend/server.js` without MongoDB installed.
   - *Mitigation:* `backend/src/config/db.js` catches the connection failure within 2.5s and activates Member 3's in-memory engine. All 9 tabs and all operations continue working with zero errors.
3. **CORS Cross-Origin Preflight:**
   - *Risk:* Browser security blocks requests if UI is opened from a different port or file system.
   - *Mitigation:* Permissive CORS middleware configured with explicit support for all HTTP methods (`GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`).

---

## 8. Summary: Ready for Execution
This plan covers every single file in the repository, details every data contract, and maps out the exact code changes needed. **No code has been modified yet.** Once the user reviews and approves this plan, implementation will begin phase by phase.
