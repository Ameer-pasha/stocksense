# Member 3 — Inventory Operations

**Ownership:** Inbound Logistics, Outbound Logistics, Internal Movements & Stock Auditing  
**Primary Modules:**
1. **Receipts (Inbound)**: Supplier PO intake, inspection, receipt validation, stock increment, ledger logging.
2. **Deliveries (Outbound)**: Customer sales dispatch, availability checks, pick/pack/validation, stock decrement, shortage prevention, ledger logging.
3. **Internal Transfers**: Intra- and inter-warehouse multi-stage movements (`Draft` $\to$ `In-Transit` $\to$ `Done`), dual-entry ledger logging (`transfer_out` and `transfer_in`).
4. **Stock Adjustments**: Physical inventory counts, discrepancy calculations (`difference = physical - system`), adjustment authorization, ledger logging with adjustment reasons (`damaged`, `lost`, `found`, `miscount`, `expired`).

---

## Canonical 4-Step Golden Flow (from Problem Statement)
1. **Step 1 — Inbound Receipt**: Receive 100 kg Steel into Main Store $\to$ Stock: +100 kg.
2. **Step 2 — Internal Transfer**: Move 60 kg Steel from Main Store to Production Rack B $\to$ Main Store: -60 kg, Production: +60 kg.
3. **Step 3 — Customer Delivery**: Deliver 20 kg finished goods $\to$ Production: -20 kg.
4. **Step 4 — Damage Adjustment**: 3 kg damaged $\to$ Discrepancy logged, Production: -3 kg.
*Every single step is logged with immutable entries in the Stock Ledger.*

---

## Directory Layout

```
member_3/
├── README.md                      # This overview and module guide
├── MEMBER_3_MODULE_CONTRACT.md    # Comprehensive technical contract & API specifications
├── receipts/                      # Inbound Receipt Operations (PO intake, verification, validation)
│   └── index.js
├── deliveries/                    # Outbound Delivery Order Operations (Picking, packing, availability checks)
│   └── index.js
├── transfers/                     # Internal Warehouse Transfers (Two-phase commit: in_transit -> done)
│   └── index.js
├── adjustments/                   # Physical Stock Audits (Discrepancy math & reason codes)
│   └── index.js
└── interfaces/                    # Connectors to Member 1 (Ledger/DB), Member 2 (Catalog), Member 4 (KPIs)
    └── index.js
```

---

## Inter-Member Dependencies

| Dependency | Owner | Purpose for Member 3 |
|---|---|---|
| **Stock Ledger & DB Engine** | **Member 1** | Audit trail recording for all 4 operational movements |
| **Auth & Security** | **Member 1** | JWT auth & user identity tracking (`performed_by`) |
| **Products & Categories** | **Member 2** | Catalog validation, SKU lookup, UoM checks |
| **Warehouses & Locations** | **Member 2** | Source/destination facility, zone, rack, and shelf verification |
| **Dashboard KPIs & Alerts** | **Member 4** | Consumes operational counts (`pending_receipts`, `pending_deliveries`, `scheduled_transfers`) |

---

## Running Member 3 Operations Backend

### Standalone Server
```bash
cd member_3
npm start
# Server listens on http://localhost:5003/api
```

### Running Test Suite
Member 3 includes an automated test suite covering all services, business rules, two-phase commits, shortage prevention, double-entry ledger audits, and HTTP endpoints:
```bash
cd member_3
npm test
```

### Core API Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/receipts` | List inbound receipts |
| `POST` | `/api/receipts` | Create inbound PO intake (`draft`) |
| `PUT / POST` | `/api/receipts/:id/validate` | Validate goods intake & increment physical stock |
| `GET` | `/api/deliveries` | List customer delivery orders |
| `GET` | `/api/deliveries/:id/availability` | Pre-dispatch shortage audit |
| `POST` | `/api/deliveries` | Create customer delivery order |
| `PUT / POST` | `/api/deliveries/:id/validate` | Shortage-gated dispatch & stock decrement |
| `GET` | `/api/transfers` | List warehouse internal transfers |
| `POST` | `/api/transfers` | Create internal transfer order |
| `PUT / POST` | `/api/transfers/:id/dispatch` | **Phase 1 Commit**: Decrement source & status $\to$ `in_transit` |
| `PUT / POST` | `/api/transfers/:id/complete` | **Phase 2 Commit**: Increment destination & status $\to$ `done` |
| `GET` | `/api/stock-adjustments` | List stock reconciliation adjustments |
| `POST` | `/api/stock-adjustments` | Audit count vs system stock with audited reason code |
| `GET` | `/api/ledger` | Double-entry stock ledger export |

