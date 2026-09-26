# Member 3: Inventory Operations — Complete Technical & API Contract

> **Role:** Member 3 (Inventory Operations)  
> **Modules Owned:** Receipts (Inbound), Delivery Orders (Outbound), Internal Transfers (Movements), Stock Adjustments (Physical Audits)  
> **Source Documents:**  
> - `StockSense.pdf` (Hackathon Problem Statement)  
> - `Odoo.txt` (Team Work Division & API Specifications)  
> - [Excalidraw Mockups](https://link.excalidraw.com/l/65VNwvy7c4X/3ENvQFu9o8R)

---

## 1. Domain Overview & Operational Scope

Member 3 owns the execution of all inventory-altering physical transactions. While Member 1 manages the underlying database and immutable audit ledger, and Member 2 manages master catalog items (Products, Categories, Warehouses, Locations), **Member 3 executes the business logic whenever physical inventory moves into, inside, or out of the enterprise.**

```
+---------------------------------------------------------------------------------------------------+
|                                  MEMBER 3: INVENTORY OPERATIONS                                   |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|  1. INBOUND RECEIPTS (Supplier PO Intake)                                                         |
|     Vendor Dispatch -> Draft Receipt -> Quality/Qty Count -> Validate -> Stock (+) -> Ledger (+)  |
|                                                                                                   |
|  2. INTERNAL TRANSFERS (Location / Warehouse Moves)                                              |
|     Draft -> Confirm Dispatch (In-Transit, Source -) -> Complete Arrival (Destination +, Done)   |
|                                                                                                   |
|  3. OUTBOUND DELIVERIES (Customer Sales Orders)                                                   |
|     Draft -> Availability Check -> Pick Items -> Pack Items -> Validate -> Stock (-) -> Ledger (-)|
|                                                                                                   |
|  4. STOCK ADJUSTMENTS (Physical Count Reconciliation)                                             |
|     Physical Count -> Discrepancy Math (Physical - System) -> Reason Code -> Stock Sync -> Ledger|
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Canonical 4-Step Inventory Flow (Golden Path Validation)

Every operational flow in Member 3 must satisfy the official test scenario defined in `StockSense.pdf`:

1. **Step 1: Inbound Receipt from Vendor**
   - Operation: Receive 100 kg "Mild Steel Rod" (`STL-001`) from "Industrial Steels Ltd" into Main Store (`WH-MAIN`).
   - Outcome: On validation, Main Store inventory increments by +100 kg. Stock Ledger logs `receipt (+100)`.
2. **Step 2: Internal Transfer to Production Rack**
   - Operation: Move 60 kg Steel from Main Store (`WH-MAIN`) to Production Floor (`WH-PROD`, Rack B).
   - Outcome: Two-phase commit. `confirm` decrements Main Store (-60 kg) with `transfer_out`. `complete` increments Production Rack B (+60 kg) with `transfer_in`. Total enterprise stock remains 100 kg.
3. **Step 3: Customer Delivery Order**
   - Operation: Customer order for 20 kg finished goods / steel from Production Floor.
   - Outcome: System verifies available stock ($\ge 20$ kg). Picking $\to$ Packing $\to$ Validate. Stock decrements by -20 kg. Stock Ledger logs `delivery (-20)`. Remaining stock: 80 kg.
4. **Step 4: Damage Adjustment**
   - Operation: Physical count reveals 3 kg steel damaged on the production floor.
   - Outcome: System stock: 40 kg vs Physical stock: 37 kg. Discrepancy: -3 kg. Reason: `damaged`. Stock adjusted to 37 kg. Stock Ledger logs `adjustment (-3, reason: damaged)`. Total enterprise stock: 77 kg.

---

## 3. Detailed Module Specifications

### 3.1 Module 1: Inbound Receipts (`/api/receipts`)
Used when shipments arrive from suppliers or manufacturing partners.

- **State Machine:**
  - `draft`: Initial creation with supplier and expected items.
  - `waiting`: Order placed / shipment in transit from supplier.
  - `done`: Goods physically received, verified, and stock credited.
  - `cancelled`: Receipt voided before validation.

- **API Contracts:**
  - **`POST /api/receipts`**
    - Request Body:
      ```json
      {
        "supplier_name": "Industrial Steels Ltd",
        "warehouse_id": 1,
        "receipt_date": "2026-09-26",
        "notes": "PO-9821 Delivery",
        "items": [
          { "product_id": 5, "quantity_ordered": 100, "quantity_received": 100, "unit_price": 45.50 }
        ]
      }
      ```
    - Response: `201 Created` with receipt details and auto-generated `receipt_number` (`REC-2026-0001`).
  - **`GET /api/receipts`**
    - Query Parameters: `?status=draft|waiting|done|cancelled&warehouse_id=1&page=1&limit=20`
  - **`GET /api/receipts/:id`**
    - Returns full receipt header, supplier, status, line items, and audit timestamps.
  - **`PUT /api/receipts/:id/validate`**
    - Body: `{ "items_received": [{ "product_id": 5, "quantity_received": 100 }] }` (optional override if count differs from order)
    - Action: Atomically increments warehouse stock, generates `Stock_Ledger` entry (`transaction_type: 'receipt'`), moves status to `done`.
  - **`PUT /api/receipts/:id/cancel`**
    - Action: Marks draft receipt as `cancelled` (only allowed if status is not `done`).

---

### 3.2 Module 2: Outbound Delivery Orders (`/api/deliveries`)
Used when stock leaves facilities for customer fulfillment or external shipping.

- **State Machine:**
  - `draft`: Order initiated.
  - `picking`: Warehouse staff retrieving items from racks/bins.
  - `packing`: Items consolidated and packed into shipping cartons.
  - `ready`: Packed, labeled, and staged for carrier dispatch.
  - `done`: Dispatched, stock decremented, and ledger updated.
  - `cancelled`: Order canceled prior to dispatch.

- **Availability Guard (Shortage Prevention):**
  - Before moving to `ready` or `done`, the system must query on-hand stock for all line items at the origin warehouse.
  - If `stock.quantity < requested_quantity`, system blocks validation and returns `400 Bad Request` with exact item shortages.

- **API Contracts:**
  - **`POST /api/deliveries`**
    - Request Body:
      ```json
      {
        "customer_name": "Apex Constructions",
        "warehouse_id": 1,
        "delivery_date": "2026-09-27",
        "notes": "Urgent site delivery",
        "items": [
          { "product_id": 5, "quantity_ordered": 20 }
        ]
      }
      ```
  - **`GET /api/deliveries`**
    - Query Parameters: `?status=&warehouse_id=&page=1&limit=20`
  - **`GET /api/deliveries/:id`**
    - Returns header, customer, line items, and fulfillment status.
  - **`GET /api/deliveries/:id/availability`**
    - Real-time stock audit for each line item in the order:
      ```json
      {
        "all_available": true,
        "items": [
          { "product_id": 5, "sku": "STL-001", "requested": 20, "available": 100, "status": "in_stock" }
        ]
      }
      ```
  - **`PUT /api/deliveries/:id/validate`**
    - Action: Enforces availability check, decrements warehouse stock, creates `Stock_Ledger` entry (`transaction_type: 'delivery'`, negative delta), marks status `done`.
  - **`PUT /api/deliveries/:id/cancel`**

---

### 3.3 Module 3: Internal Transfers (`/api/transfers`)
Used for intra-warehouse moves (e.g. Rack A $\to$ Rack B) and inter-warehouse moves (Main Warehouse $\to$ Production Floor).

- **State Machine:**
  - `draft`: Transfer planned and scheduled.
  - `in_transit`: Goods picked and dispatched from origin; in transit between locations.
  - `done`: Goods arrived, inspected, and restocked at destination.
  - `cancelled`: Transfer aborted.

- **Two-Phase Commit Protocol:**
  - **Phase 1 (`confirm` action)**:
    - Origin stock is decremented immediately (`quantity_change: -qty`).
    - Ledger logs `transfer_out`.
    - Status becomes `in_transit`.
  - **Phase 2 (`complete` action)**:
    - Destination stock is incremented upon physical arrival (`quantity_change: +qty`).
    - Ledger logs `transfer_in`.
    - Status becomes `done`.

- **API Contracts:**
  - **`POST /api/transfers`**
    - Body:
      ```json
      {
        "from_warehouse_id": 1,
        "to_warehouse_id": 2,
        "from_location_id": 101,
        "to_location_id": 202,
        "scheduled_date": "2026-09-26",
        "notes": "Replenish production line",
        "items": [
          { "product_id": 5, "quantity": 60 }
        ]
      }
      ```
  - **`GET /api/transfers`**
    - Query Parameters: `?status=&from_warehouse=&to_warehouse=&page=1&limit=20`
  - **`GET /api/transfers/:id`**
  - **`PUT /api/transfers/:id/confirm`** $\to$ Initiates transit (decrements source, logs `transfer_out`)
  - **`PUT /api/transfers/:id/complete`** $\to$ Finalizes arrival (increments destination, logs `transfer_in`)
  - **`PUT /api/transfers/:id/cancel`**

---

### 3.4 Module 4: Stock Adjustments (`/api/stock-adjustments`)
Used for periodic physical cycle counts and auditing discrepancies.

- **Formula:**
  $$\Delta = \text{counted\_quantity} - \text{system\_quantity}$$

- **Mandatory Reason Codes:**
  - `damaged`: Breakage, corrosion, physical wear.
  - `lost`: Unaccounted physical shortage / shrinkage.
  - `found`: Discovered unrecorded inventory.
  - `miscount`: Human error during prior count.
  - `expired`: Shelf-life expiration.

- **API Contracts:**
  - **`POST /api/stock-adjustments`**
    - Request Body:
      ```json
      {
        "product_id": 5,
        "warehouse_id": 2,
        "location_id": 202,
        "counted_quantity": 37,
        "reason": "damaged",
        "notes": "3 kg rods bent and unusable"
      }
      ```
    - Behavior: Reads system stock (40), calculates difference (-3), sets new stock to 37, writes `Stock_Ledger` entry (`transaction_type: 'adjustment'`, delta: -3).
  - **`GET /api/stock-adjustments`**
    - Query Parameters: `?warehouse_id=&product_id=&reason=&page=1&limit=20`
  - **`GET /api/stock-adjustments/history`**
    - Returns audit history with user info, before/after balances, difference, and reason.

---

## 4. Error Handling Standard

Member 3 APIs return consistent error structures:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Cannot validate delivery. Product 'STL-001' has only 8 units available, but 20 were requested.",
    "field": "items",
    "timestamp": "2026-09-26T11:50:00Z"
  }
}
```

Standard Error Codes:
- `VALIDATION_FAILED` (400)
- `INSUFFICIENT_STOCK` (400)
- `INVALID_STATUS_TRANSITION` (400)
- `SAME_ORIGIN_DESTINATION` (400)
- `RESOURCE_NOT_FOUND` (404)
- `OPERATION_LOCKED` (409)
