# Demo and team handoff

## Preparation

1. Start a MongoDB **replica set**, the API, and create an admin using the README. Run `npm run seed` for Main Warehouse (100 Steel Rods + 15 Copper Wire) and Secondary Warehouse (zero Safety Gloves). The seed is idempotent.
2. Log in as admin using `POST /api/auth/login`; set `token` in the Postman collection or send `Authorization: Bearer <token>` on every private route. Check `/api/health` and `/api/dashboard/kpis`.
3. Prepare a browser frontend if your team built one. Configure its dev server to proxy `/api` to the backend; do not point browser JavaScript at `localhost:5000` when demonstrating a remote preview.

## Record this API or frontend walkthrough (approximately five minutes)

| Segment | Steps | What to explain |
| --- | --- | --- |
| Login & dashboard | Wrong password → 401; valid login → JWT; missing token on `/dashboard/kpis` → 401. | Staff signup cannot choose admin; admin bootstrapped separately. |
| Warehouse/products | List two seeded warehouses and three products; inspect `/warehouses/:id/stock`. | Ledger and balance are different: ledger is history, balance is current state. |
| Receipt | `POST /receipts` for 50 Steel Rods to Main; `PUT /receipts/:id/validate`. | Main stock goes 100 → 150; duplicate validate gives 409. |
| Transfer | `POST /transfers` for 20 Steel Rods Main → Secondary; confirm, then complete. | Main 150 → 130 at confirm; Secondary 0 → 20 at complete. Out and in ledger entries share the transfer reference. |
| Adjustment | `POST /stock-adjustments` for Steel Rods/Main counted_quantity 127, reason damaged. | Difference -3, Main 130 → 127; adjustment ledger entry is generated atomically. |
| Alerts, search, ledger | `/alerts/low-stock`, `/alerts/out-of-stock`, `/search/products?q=steel`, `/stock-ledger?transaction_type=transfer_out`, `/stock-ledger/summary`, `/dashboard/recent-operations`. | Filtered, paginated immutable movement history and live KPIs. |
| Password reset | `/auth/forgot-password` → dev OTP (or configured email) → `/auth/verify-otp` → `/auth/reset-password`; log in with the new password. | Reset token is not an access token; old access tokens stop working. |

Add a delivery draft/validation if you want to demonstrate stock going down and pending delivery KPI changing. For transfer cancellation, create a *new* transfer, confirm it, then cancel: stock returns to the source with a `transfer_cancelled` entry. A completed transfer cannot be cancelled. Try insufficient stock to show a 409 **without** a partial stock/ledger write.

## Collaboration/manual tasks (not executable from this repository)

- Share [API_DOCUMENTATION.md](API_DOCUMENTATION.md), the `adjustStock` transaction example, and the Postman collection with teammates. Agree on `snake_case` names and Mongoose timestamps (`createdAt`/`updatedAt`).
- Select/submit the problem statement in the competition portal, add collaborator GitHub usernames/evaluator if provided, and take required confirmation screenshots **manually**. No usernames, portal access or screenshots are supplied here.
- Record/edit the demo with OBS/Loom/etc., upload as unlisted or link-shareable, and submit its URL in the portal **manually**. A recording cannot be produced from backend source alone.
- Git work for this session belongs to branch `arena/01a0dc7d-stock`, **not** `main`. Coordinate merging with teammates after reviewing and testing.
