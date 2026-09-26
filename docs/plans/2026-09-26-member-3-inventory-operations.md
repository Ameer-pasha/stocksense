# Member 3: Inventory Operations Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the complete end-to-end Inventory Operations suite for Member 3 (Receipts, Deliveries, Internal Transfers, and Stock Adjustments) with reactive stock updating, immutable double-entry ledger logging, shortage prevention, two-phase transfers, and full frontend-backend integration.

**Architecture:**
- State machine-driven operational workflows adhering to `StockSense.pdf` and `MEMBER_3_MODULE_CONTRACT.md`.
- Shared event-driven service layer (`receiptService`, `deliveryService`, `transferService`, `adjustmentService`) that interfaces with Member 1's `stockLedgerService` and Member 2's `productService`.
- React frontend components for Receipts, Deliveries, and Transfers replacing the placeholders in `src/App.jsx`.
- Express.js REST API endpoints in `backend/` and `member_3/` with fallback support in `apiClient.js`.

**Tech Stack:** React 18, Vite, Lucide Icons, Tailwind / Vanilla CSS design system, Express.js, Node.js.

---

### Task 1: Inbound Receipts Service & Initial Seed Data

**Files:**
- Create: `src/modules/receipts/data/initialReceipts.js`
- Create: `src/modules/receipts/services/receiptService.js`
- Test: `src/modules/receipts/tests/receiptService.test.js`

**Step 1: Write initial seed data for receipts**
Create `src/modules/receipts/data/initialReceipts.js` with realistic supplier receipt records matching `StockSense.pdf` (e.g. Tata Steel Works PO-8821, 100 kg Steel Rods).

**Step 2: Implement `receiptService.js`**
- `getReceipts()`: Read from `apiClient.get('/receipts')` with fallback to `localStorage`.
- `createReceipt(receiptData)`: Auto-assign `id: REC-YYYY-XXXX`, status `draft`.
- `validateReceipt(receiptId)`:
  - Iterates over items.
  - Calls `productService.applyLocationAdjustment` to increment stock.
  - Calls `stockLedgerService.logEntry` with `documentType: 'RECEIPT'`, delta `+qty`.
  - Sets status to `done`.
- `cancelReceipt(receiptId)`: Sets status to `cancelled`.

**Step 3: Verification test**
Verify creating and validating a receipt updates stock and emits ledger record.

---

### Task 2: Outbound Deliveries Service & Initial Seed Data

**Files:**
- Create: `src/modules/deliveries/data/initialDeliveries.js`
- Create: `src/modules/deliveries/services/deliveryService.js`

**Step 1: Write initial seed data for deliveries**
Create `src/modules/deliveries/data/initialDeliveries.js` with sales order fulfillment records (e.g., TechCorp HQ DEL-2026-001, 10 Ergonomic Chairs).

**Step 2: Implement `deliveryService.js`**
- `getDeliveries()`: Fetches deliveries from backend or `localStorage`.
- `createDelivery(deliveryData)`: Creates delivery in `draft` state.
- `checkAvailability(deliveryId)`: Queries `productService` for each line item; flags items where available stock < requested.
- `validateDelivery(deliveryId)`:
  - Enforces shortage check: throws error if any item is insufficient.
  - Decrements location stock via `productService`.
  - Calls `stockLedgerService.logEntry` with `documentType: 'DELIVERY'`, delta `-qty`.
  - Sets status to `done`.
- `cancelDelivery(deliveryId)`: Sets status to `cancelled`.

---

### Task 3: Internal Transfers Service (Two-Phase Commit)

**Files:**
- Create: `src/modules/transfers/data/initialTransfers.js`
- Create: `src/modules/transfers/services/transferService.js`

**Step 1: Write initial seed data for transfers**
Create `src/modules/transfers/data/initialTransfers.js` with multi-warehouse transfer records (Main Warehouse $\to$ Production Floor Staging).

**Step 2: Implement `transferService.js`**
- `getTransfers()`: Fetches transfers from backend or `localStorage`.
- `createTransfer(transferData)`: Validates source $\ne$ destination, creates in `draft`.
- `confirmDispatch(transferId)`:
  - Sets status to `in_transit`.
  - Decrements source location stock.
  - Calls `stockLedgerService.logEntry` with `documentType: 'INTERNAL_TRANSFER_OUT'`, delta `-qty`.
- `completeArrival(transferId)`:
  - Sets status to `done`.
  - Increments destination location stock.
  - Calls `stockLedgerService.logEntry` with `documentType: 'INTERNAL_TRANSFER_IN'`, delta `+qty`.
- `cancelTransfer(transferId)`: Sets status to `cancelled`.

---

### Task 4: Inbound Receipts UI (List & Filters)

**Files:**
- Create: `src/modules/receipts/hooks/useReceipts.js`
- Create: `src/modules/receipts/components/ReceiptListTable.jsx`
- Create: `src/modules/receipts/ReceiptsModule.jsx`

**Step 1: Create `useReceipts.js` hook**
Exposes `receipts`, `loading`, `error`, `createReceipt`, `validateReceipt`, `cancelReceipt`, `refreshReceipts`. Listens to browser events for reactive updates.

**Step 2: Build `ReceiptListTable.jsx`**
Columns: Receipt Number, Date, Supplier, Target Warehouse, Items Summary, Status Badge (`Draft`, `Waiting`, `Done`, `Cancelled`), Actions ("View & Validate", "Cancel").

**Step 3: Build `ReceiptsModule.jsx`**
Header with "New Receipt" button, KPI metric cards (Total Receipts, Pending Validation, Completed), search by supplier/PO, and status filter tabs.

---

### Task 5: Inbound Receipts UI (Creation & Validation Modals)

**Files:**
- Create: `src/modules/receipts/components/ReceiptFormModal.jsx`
- Create: `src/modules/receipts/components/ReceiptDetailModal.jsx`

**Step 1: Build `ReceiptFormModal.jsx`**
- Form fields: Supplier Name, Target Warehouse, Expected Receipt Date, Notes.
- Dynamic line item table: Product Selector (from `useProducts`), Location Selector, Quantity Ordered, Unit Price. "Add Item" and "Remove Item" buttons.
- Validation: at least 1 item with positive quantity.

**Step 2: Build `ReceiptDetailModal.jsx`**
- Displays line items breakdown with units and quantities.
- Prominent CTA: "Validate Receipt (Increment Stock)" which executes stock crediting and ledger logging with toast notification.

---

### Task 6: Outbound Deliveries UI (List & Filters)

**Files:**
- Create: `src/modules/deliveries/hooks/useDeliveries.js`
- Create: `src/modules/deliveries/components/DeliveryListTable.jsx`
- Create: `src/modules/deliveries/DeliveriesModule.jsx`

**Step 1: Create `useDeliveries.js` hook**
Exposes `deliveries`, `createDelivery`, `validateDelivery`, `cancelDelivery`, `checkAvailability`.

**Step 2: Build `DeliveryListTable.jsx`**
Columns: Delivery Number, Date, Customer, Warehouse, Items Summary, Availability Status (All Available vs Shortage), Status Badge (`Draft`, `Picking`, `Ready`, `Done`, `Cancelled`), Actions.

**Step 3: Build `DeliveriesModule.jsx`**
Header with "New Delivery Order" button, KPI cards (Pending Dispatch, Total Dispatched), search bar, and status filters.

---

### Task 7: Outbound Deliveries UI (Creation, Availability Guard & Validation)

**Files:**
- Create: `src/modules/deliveries/components/DeliveryFormModal.jsx`
- Create: `src/modules/deliveries/components/DeliveryDetailModal.jsx`

**Step 1: Build `DeliveryFormModal.jsx`**
- Customer name, Source Warehouse/Location, Delivery Date, Notes.
- Dynamic item rows with current stock hints.

**Step 2: Build `DeliveryDetailModal.jsx`**
- Line item table with real-time stock availability chips:
  - Green chip: "In Stock" (e.g. 100 available)
  - Red chip: "Shortage" (e.g. 5 available, 20 needed)
- If shortage exists, disable "Validate Delivery" and display shortage warning alert.
- When stock is sufficient, "Validate Delivery" decrements inventory, logs ledger, and updates delivery to `done`.

---

### Task 8: Internal Transfers UI (Two-Phase Commit Interface)

**Files:**
- Create: `src/modules/transfers/hooks/useTransfers.js`
- Create: `src/modules/transfers/components/TransferListTable.jsx`
- Create: `src/modules/transfers/components/TransferFormModal.jsx`
- Create: `src/modules/transfers/components/TransferDetailModal.jsx`
- Create: `src/modules/transfers/TransfersModule.jsx`

**Step 1: Create `useTransfers.js` hook**
Handles transfer state, `confirmDispatch`, and `completeArrival`.

**Step 2: Build `TransferFormModal.jsx`**
Origin Warehouse/Location selector, Destination Warehouse/Location selector, Scheduled Date, Items to transfer.

**Step 3: Build `TransferDetailModal.jsx`**
Visual step tracker:
`Draft` $\xrightarrow{\text{Confirm Dispatch}}$ `In-Transit` $\xrightarrow{\text{Confirm Arrival}}$ `Done`.
Shows source decrement and destination increment timestamps.

**Step 4: Build `TransfersModule.jsx`**
Table of transfers, status filters (`All`, `Draft`, `In Transit`, `Done`), and actions.

---

### Task 9: Stock Adjustments Integration & Problem Statement Alignment

**Files:**
- Modify: `src/modules/adjustments/services/adjustmentService.js`
- Modify: `src/modules/adjustments/components/AdjustmentModal.jsx`

**Step 1: Update Reason Codes & Location Paths**
Ensure reasons strictly follow `StockSense.pdf`: `damaged`, `lost`, `found`, `miscount`, `expired`. Add specific location code (Rack/Shelf/Bin) selection to match multi-warehouse model.

**Step 2: Verify Discrepancy Formula**
Verify $\Delta = \text{Counted} - \text{Recorded}$. Test both negative discrepancy (shrinkage/damage) and positive discrepancy (surplus).

---

### Task 10: App Integration & Dynamic KPI Badge Linking

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/modules/shared/components/Sidebar.jsx`
- Modify: `src/modules/dashboard/DashboardSummary.jsx`

**Step 1: Replace Placeholders in `src/App.jsx`**
- Import `ReceiptsModule`, `DeliveriesModule`, and `TransfersModule`.
- Replace `ModulePlaceholder` under `activeTab === 'receipts'` with `<ReceiptsModule onNotify={handleNotify} />`.
- Replace `ModulePlaceholder` under `activeTab === 'deliveries'` with `<DeliveriesModule onNotify={handleNotify} />`.
- Replace `ModulePlaceholder` under `activeTab === 'transfers'` with `<TransfersModule onNotify={handleNotify} />`.

**Step 2: Dynamic Badge Counters in Sidebar**
Expose real-time counts for pending receipts, pending deliveries, and active transfers directly in the sidebar navigation badges.

---

### Task 11: Backend Express Endpoints for Member 3

**Files:**
- Create: `backend/src/routes/receiptRoutes.js`
- Create: `backend/src/routes/deliveryRoutes.js`
- Create: `backend/src/routes/transferRoutes.js`
- Create: `backend/src/routes/adjustmentRoutes.js`
- Create: `backend/src/controllers/receiptController.js`
- Create: `backend/src/controllers/deliveryController.js`
- Create: `backend/src/controllers/transferController.js`
- Create: `backend/src/controllers/adjustmentController.js`
- Modify: `backend/server.js` or `backend/src/app.js`

**Step 1: Implement Controllers & Routes**
- Receipts: `POST /api/receipts`, `GET /api/receipts`, `PUT /api/receipts/:id/validate`
- Deliveries: `POST /api/deliveries`, `GET /api/deliveries`, `GET /api/deliveries/:id/availability`, `PUT /api/deliveries/:id/validate`
- Transfers: `POST /api/transfers`, `GET /api/transfers`, `PUT /api/transfers/:id/confirm`, `PUT /api/transfers/:id/complete`
- Adjustments: `POST /api/stock-adjustments`, `GET /api/stock-adjustments`

**Step 2: Maintain Standard Response Envelope**
Ensure all routes return `{ success: true, message: "...", data: {...} }`.

---

### Task 12: End-to-End Canonical 4-Step Golden Flow Verification

**Step 1: Execute Step 1 (Vendor Receipt)**
Receive 100 kg Steel (`STL-001`) into Main Store. Validate.
*Expected:* Main Store stock = 100 kg. Stock Ledger has entry `RECEIPT (+100)`.

**Step 2: Execute Step 2 (Internal Transfer)**
Move 60 kg Steel from Main Store to Production Rack B. Confirm dispatch $\to$ Complete arrival.
*Expected:* Main Store = 40 kg, Production Rack B = 60 kg. Total = 100 kg. Stock Ledger has `TRANSFER_OUT (-60)` and `TRANSFER_IN (+60)`.

**Step 3: Execute Step 3 (Customer Delivery)**
Order 20 kg from Production Rack B. Validate delivery.
*Expected:* Production Rack B = 40 kg. Total = 80 kg. Stock Ledger has `DELIVERY (-20)`.

**Step 4: Execute Step 4 (Damage Adjustment)**
Physical count reveals 3 kg damaged. Counted = 37 kg. Reason = `damaged`. Submit.
*Expected:* Production Rack B = 37 kg. Total = 77 kg. Stock Ledger has `ADJUSTMENT (-3, reason: damaged)`.
