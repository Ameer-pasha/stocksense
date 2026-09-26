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
