# StockSense — Member 2 Module Contract
**Owner**: Member 2 (Tarun)  
**Domain**: Product & Warehouse Management (Application & Service Layer)  
**Status**: Formal Team Interface Contract  

---

## 1. System Scope & Boundaries

```text
┌─────────────────────────────────────────────────────────────────┐
│                     MEMBER 2 APPLICATION LAYER                  │
│                                                                 │
│   [A] Product Management          [D] Location Management       │
│   [B] Category Management         [E] Reorder Rules Engine      │
│   [C] Warehouse Management        [F] Search & Filters          │
│   [G] Product Availability View (Read-Only Representation)      │
├─────────────────────────────────────────────────────────────────┤
│                   SHARED API / SERVICE CONTRACT                 │
├─────────────────────────────────────────────────────────────────┤
│         DATABASE & REPOSITORY LAYER (Owned by Database Lead)    │
│               [No direct SQL / No migration authoring]          │
└─────────────────────────────────────────────────────────────────┘
```

### Explicit Non-Ownership Checklist
| Capability | Owner | Member 2 Responsibility |
| :--- | :--- | :--- |
| **Database & Schema Authoring** | Database Owner | Consumes repository/interfaces only |
| **User Authentication & Auth Tokens** | Member 1 | Reads `user_id` / context from headers |
| **Stock Ledger Engine & Audit Trail** | Member 1 | Consumes ledger queries for read-only availability |
| **Inbound Receipts (PO / Vendor)** | Member 3 | Exposes active products/locations for picklists |
| **Outbound Deliveries (Sales / Dispatch)** | Member 3 | Exposes active products/locations for picking |
| **Internal Stock Transfers** | Member 3 | Exposes location hierarchy for origin & destination |
| **Stock Adjustments & Physical Scans** | Member 3 | Exposes active products and location paths |
| **Executive Dashboard & KPIs** | Member 4 | Exposes product/warehouse summary metrics |
| **Alert Notification UI / Channels** | Member 4 | Exposes reorder rule breach status queries |

---

## 2. Phase 0 — Shared Database Contract Queries
The following schema requirements must be confirmed with the Database Owner:

1. **Product Fields**:
   - `id`: UUID vs integer auto-increment
   - `sku`: String (unique index required, normalized uppercase)
   - `name`: String (not null)
   - `category_id`: Foreign key reference to `categories.id`
   - `unit_of_measure`: Enum / string (e.g., `kg`, `pcs`, `box`, `mtr`, `ltr`)
   - `description`: Text (optional)
   - `is_active`: Boolean (default `true`)

2. **Category Fields**:
   - `id`: Primary key
   - `name`: String (unique)
   - `code`: String (optional uppercase slug)
   - `parent_id`: Foreign key reference to `categories.id` (nullable for top-level)
   - `is_active`: Boolean (default `true`)

3. **Warehouse Fields**:
   - `id`: Primary key
   - `name`: String (not null)
   - `code`: String (unique uppercase, e.g. `WH-BLR-01`)
   - `address`, `city`, `state`, `pincode`: Strings
   - `capacity_sqft`: Integer/Float (optional)
   - `is_active`: Boolean (default `true`)

4. **Location Fields**:
   - `id`: Primary key
   - `warehouse_id`: Foreign key to `warehouses.id` (not null)
   - `parent_id`: Foreign key to `locations.id` (nullable for top-level zones)
   - `name`: String (e.g. `Rack A`, `Shelf A1`, `Receiving Bay`)
   - `code`: String (unique per warehouse, e.g. `WH1-RCV`, `WH1-RA-S1`)
   - `type`: Enum (`zone`, `rack`, `shelf`, `bin`, `bay`)
   - `is_active`: Boolean (default `true`)

5. **Reorder Rule Fields**:
   - `id`: Primary key
   - `product_id`: Foreign key to `products.id`
   - `location_id`: Foreign key to `locations.id` (optional for warehouse-level)
   - `min_quantity`: Numeric (> 0)
   - `max_quantity`: Numeric (> min_quantity)
   - `reorder_quantity`: Numeric (> 0)
   - `is_active`: Boolean (default `true`)

---

## 3. Product API Specification

### `GET /api/products`
Retrieves paginated and filtered products list.
- **Query Parameters**:
  - `search` (string, optional): Search term for SKU or name
  - `category_id` (integer, optional): Filter by category
  - `warehouse_id` (integer, optional): Filter by warehouse where product is stocked
  - `is_active` (boolean, optional): Filter active/inactive
  - `page` (integer, default: 1), `limit` (integer, default: 20)
- **Response `200 OK`**:
```json
{
  "items": [
    {
      "id": 1,
      "sku": "STL-001",
      "name": "Mild Steel Rod 12mm",
      "category_id": 4,
      "category_name": "Raw Materials",
      "unit_of_measure": "kg",
      "description": "High tensile structural grade",
      "is_active": true,
      "total_available_stock": 240,
      "created_at": "2026-09-20T10:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

### `GET /api/products/:id`
Retrieves single product details with summary availability.
- **Response `200 OK`**:
```json
{
  "id": 1,
  "sku": "STL-001",
  "name": "Mild Steel Rod 12mm",
  "category_id": 4,
  "unit_of_measure": "kg",
  "description": "High tensile structural grade",
  "is_active": true
}
```

### `POST /api/products`
Creates a new product with validation.
- **Request Body**:
```json
{
  "sku": "STL-002",
  "name": "Mild Steel Rod 16mm",
  "category_id": 4,
  "unit_of_measure": "kg",
  "description": "Heavy industrial specification"
}
```
- **Validation Rules**:
  - `name`: Required, trimmed, length 2–120 characters
  - `sku`: Required, alphanumeric with dashes/underscores, unique, uppercase
  - `category_id`: Required, must reference active category
  - `unit_of_measure`: Required, must be in supported UOM catalog
- **Response `201 Created`**: Returns created product entity.
- **Errors**: `400 Bad Request` (validation error), `409 Conflict` (SKU already exists).

### `PUT /api/products/:id`
Updates existing product details. (Note: SKU modification is locked if stock ledger entries exist).
- **Request Body**: Same as POST (excluding or matching original SKU).
- **Response `200 OK`**: Returns updated product.

### `PATCH /api/products/:id/status`
Toggles active / inactive state (soft delete pattern to preserve ledger integrity).
- **Request Body**:
```json
{
  "is_active": false
}
```
- **Response `200 OK`**: `{ "id": 1, "is_active": false }`

### `GET /api/products/:id/availability`
Read-only stock availability breakdown across warehouses and storage locations.
- **Response `200 OK`**:
```json
{
  "product_id": 1,
  "sku": "STL-001",
  "unit": "kg",
  "total_stock": 140,
  "locations": [
    {
      "warehouse_id": 1,
      "warehouse_name": "Bangalore Central DC",
      "location_id": 102,
      "location_code": "WH1-RA-S1",
      "location_name": "Rack A / Shelf 1",
      "available_quantity": 90
    },
    {
      "warehouse_id": 1,
      "warehouse_name": "Bangalore Central DC",
      "location_id": 103,
      "location_code": "WH1-RA-S2",
      "location_name": "Rack A / Shelf 2",
      "available_quantity": 50
    }
  ]
}
```

---

## 4. Category API Specification

- `GET /api/categories`: Returns all categories (supports `?tree=true` for parent/child nesting).
- `POST /api/categories`: Creates category.
  - Body: `{ "name": "Raw Materials", "code": "RAW", "parent_id": null }`
- `PUT /api/categories/:id`: Updates category name / parent.
- `PATCH /api/categories/:id/status`: Soft toggles category active status.

---

## 5. Warehouse API Specification

- `GET /api/warehouses`: Returns all warehouses with location counts.
- `GET /api/warehouses/:id`: Returns warehouse details.
- `POST /api/warehouses`: Creates warehouse.
  - Body:
    ```json
    {
      "name": "Bangalore Central DC",
      "code": "WH-BLR-01",
      "address": "Plot 42, Electronic City Phase 2",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560100",
      "capacity_sqft": 45000
    }
    ```
- `PUT /api/warehouses/:id`: Updates warehouse information.
- `PATCH /api/warehouses/:id/status`: Soft toggles active status.

---

## 6. Location API Specification

- `GET /api/warehouses/:warehouseId/locations`: Returns location hierarchy for a warehouse.
- `POST /api/locations`: Creates location or nested child location.
  - Body:
    ```json
    {
      "warehouse_id": 1,
      "parent_id": 10,
      "name": "Shelf A1",
      "code": "WH1-RA-S1",
      "type": "shelf"
    }
    ```
- `PUT /api/locations/:id`: Updates location name / code / type.
- `PATCH /api/locations/:id/status`: Soft toggles active status.

---

## 7. Reordering Rules API Specification

- `GET /api/reorder-rules`: Returns configured rules with current stock comparison.
  - Query params: `product_id`, `warehouse_id`, `status` (`breached`, `adequate`, `surplus`)
- `POST /api/reorder-rules`: Creates a reorder threshold rule.
  - Body:
    ```json
    {
      "product_id": 1,
      "location_id": 102,
      "min_quantity": 50,
      "max_quantity": 300,
      "reorder_quantity": 100
    }
    ```
- `PUT /api/reorder-rules/:id`: Updates quantities.
- `DELETE /api/reorder-rules/:id`: Deletes rule.

---

## 8. Error Response Standard
All Member 2 services and endpoints return consistent JSON error envelopes:
```json
{
  "error": {
    "code": "PRODUCT_ALREADY_EXISTS",
    "message": "Product with SKU 'STL-001' already exists in the system.",
    "field": "sku",
    "timestamp": "2026-09-26T11:20:00Z"
  }
}
```
Standard Error Codes:
- `VALIDATION_FAILED` (400)
- `RESOURCE_NOT_FOUND` (404)
- `SKU_ALREADY_EXISTS` (409)
- `WAREHOUSE_CODE_EXISTS` (409)
- `INVALID_LOCATION_HIERARCHY` (422)
- `CANNOT_DEACTIVATE_ACTIVE_DEPENDENCY` (422)
