const assert = require('assert');
const http = require('http');
const app = require('../../backend/src/app');

async function runOperationsBridgeTests() {
  console.log('--- Phase 2 Test: Operations Bridge & Business Rules Enforcement ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Initial State Check for Test SKU
    const initialProdRes = await fetch(`${baseUrl}/products/PRD-000101`);
    assert.strictEqual(initialProdRes.status, 200);
    const initialProd = (await initialProdRes.json()).data;
    const initialStock = initialProd.stock;
    console.log(`✓ Initial PRD-000101 stock: ${initialStock} units`);

    // 2. Inbound Receipt Intake & Stock Increment
    const receiptPayload = {
      supplier: 'Apex Microelectronics Supply',
      warehouse: 'WH-MAIN',
      date: '2026-09-26',
      status: 'Done',
      items: [
        { productId: 'PRD-000101', name: 'Solar Inverter Module V3', qty: 50, cost: 210.00 }
      ]
    };
    const recRes = await fetch(`${baseUrl}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptPayload)
    });
    assert.strictEqual(recRes.status, 201, 'POST /api/receipts should return 201');
    const recData = await recRes.json();
    assert.strictEqual(recData.data.status, 'Done');

    // Verify stock incremented by +50
    const afterRecProdRes = await fetch(`${baseUrl}/products/PRD-000101`);
    const afterRecStock = (await afterRecProdRes.json()).data.stock;
    assert.strictEqual(afterRecStock, initialStock + 50, 'Stock must increment by 50');
    console.log(`✓ Receipt intake validated: stock incremented from ${initialStock} to ${afterRecStock}`);

    // 3. Shortage Prevention Gate Test (Attempt Over-Delivery)
    const excessDeliveryPayload = {
      customer: 'SpaceX Boca Chica',
      warehouse: 'WH-MAIN',
      date: '2026-09-26',
      status: 'Done',
      items: [
        { productId: 'PRD-000101', qty: 99999 } // Way beyond available
      ]
    };
    const excessRes = await fetch(`${baseUrl}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(excessDeliveryPayload)
    });
    assert.strictEqual(excessRes.status, 400, 'Over-delivery must be rejected with HTTP 400');
    const excessJson = await excessRes.json();
    assert.strictEqual(excessJson.shortage, true, 'Error response must flag shortage');
    assert(excessJson.error.includes('insufficient stock'), 'Error message must explain shortage');
    console.log(`✓ Shortage Prevention Gate successfully blocked over-delivery: "${excessJson.error.slice(0, 70)}..."`);

    // 4. Valid Customer Delivery & Stock Decrement
    const validDeliveryPayload = {
      customer: 'Tesla Austin Megapack',
      warehouse: 'WH-MAIN',
      date: '2026-09-26',
      status: 'Done',
      items: [
        { productId: 'PRD-000101', qty: 30 }
      ]
    };
    const delRes = await fetch(`${baseUrl}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validDeliveryPayload)
    });
    assert.strictEqual(delRes.status, 201, 'Valid delivery must return 201');

    // Verify stock decremented by -30
    const afterDelProdRes = await fetch(`${baseUrl}/products/PRD-000101`);
    const afterDelStock = (await afterDelProdRes.json()).data.stock;
    assert.strictEqual(afterDelStock, afterRecStock - 30, 'Stock must decrement by 30');
    console.log(`✓ Delivery dispatch validated: stock decremented from ${afterRecStock} to ${afterDelStock}`);

    // 5. Two-Phase Internal Stock Transfer
    // Phase 1: Dispatch from Origin (deducts origin, status In-Transit)
    const transferPayload = {
      source: 'WH-MAIN',
      dest: 'WH-NORTH',
      productId: 'PRD-000101',
      qty: 20,
      reason: 'Fulfill North Hub regional order'
    };
    const trfRes = await fetch(`${baseUrl}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transferPayload)
    });
    assert.strictEqual(trfRes.status, 201);
    const trfData = (await trfRes.json()).data;
    assert.strictEqual(trfData.status, 'In-Transit');

    const afterTrfDispatchRes = await fetch(`${baseUrl}/products/PRD-000101`);
    const afterTrfDispatchStock = (await afterTrfDispatchRes.json()).data.stock;
    assert.strictEqual(afterTrfDispatchStock, afterDelStock - 20, 'Origin stock must decrement upon dispatch');
    console.log(`✓ Transfer Phase 1 (Dispatch) verified: origin stock decremented by 20 to ${afterTrfDispatchStock}`);

    // Phase 2: Complete Arrival at Destination
    const completeTrfRes = await fetch(`${baseUrl}/transfers/${trfData.id}/complete`, {
      method: 'PUT'
    });
    assert.strictEqual(completeTrfRes.status, 200);
    const completeTrfData = (await completeTrfRes.json()).data;
    assert.strictEqual(completeTrfData.status, 'Completed');
    console.log(`✓ Transfer Phase 2 (Arrival) verified: status transitioned to Completed`);

    // 6. Physical Inventory Stock Adjustment & Reason Write-off
    const adjPayload = {
      productId: 'PRD-000101',
      realStock: 255, // Explicit count
      reason: 'damaged',
      remarks: 'Cracked outer casing write-off',
      auditor: 'Ameer Pasha'
    };
    const adjRes = await fetch(`${baseUrl}/adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adjPayload)
    });
    assert.strictEqual(adjRes.status, 201);
    const adjData = (await adjRes.json()).data;
    assert.strictEqual(adjData.realStock, 255);

    const afterAdjRes = await fetch(`${baseUrl}/products/PRD-000101`);
    const afterAdjStock = (await afterAdjRes.json()).data.stock;
    assert.strictEqual(afterAdjStock, 255, 'Product stock must reconcile to counted 255');
    console.log(`✓ Stock Adjustment verified: physical count reconciled to ${afterAdjStock} with reason "damaged"`);

    // 7. Audit History Ledger Verification
    const histRes = await fetch(`${baseUrl}/history`);
    assert.strictEqual(histRes.status, 200);
    const histData = (await histRes.json()).data;
    assert(Array.isArray(histData), 'History must be an array');
    const types = histData.map(h => h.type);
    assert(types.includes('RECEIPT'), 'Ledger must include RECEIPT');
    assert(types.includes('DELIVERY'), 'Ledger must include DELIVERY');
    assert(types.includes('TRANSFER'), 'Ledger must include TRANSFER');
    assert(types.includes('ADJUSTMENT'), 'Ledger must include ADJUSTMENT');
    console.log(`✓ Audit History Ledger verified: contains all ${histData.length} physical movements with types: ${[...new Set(types)].join(', ')}`);

    console.log(' All Phase 2 Operations Bridge assertions passed successfully!\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

if (require.main === module) {
  runOperationsBridgeTests().catch((err) => {
    console.error('Phase 2 Test Failed:', err);
    process.exit(1);
  });
}

module.exports = runOperationsBridgeTests;
