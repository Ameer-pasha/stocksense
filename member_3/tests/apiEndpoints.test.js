const assert = require('assert');
const http = require('http');
const app = require('../server');

async function runApiTests() {
  console.log('--- Testing Member 3: HTTP API Endpoints Integration ---');

  // Start HTTP server on dynamic port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Health Check
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
    const healthJson = await healthRes.json();
    assert.strictEqual(healthJson.status, 'online');
    assert.strictEqual(healthJson.module, 'Member 3 - Inventory Operations');
    console.log('✓ Health check endpoint verified');

    // 2. Receipts Endpoints
    const receiptsRes = await fetch(`${baseUrl}/receipts`);
    assert.strictEqual(receiptsRes.status, 200);
    const receiptsData = await receiptsRes.json();
    assert(Array.isArray(receiptsData.data), 'Receipts data must be an array');
    console.log(`✓ GET /api/receipts verified (${receiptsData.data.length} records)`);

    // Create a new receipt via POST
    const newReceiptPayload = {
      referenceNumber: `REC-API-TEST-${Date.now()}`,
      supplierName: 'API Test Supplier',
      warehouseId: 'WH-MAIN',
      location: 'Store A',
      lines: [
        { productId: 'PROD-API-1', productName: 'API Test Item', quantity: 50, uom: 'units' }
      ]
    };
    const createRecRes = await fetch(`${baseUrl}/receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReceiptPayload)
    });
    assert.strictEqual(createRecRes.status, 201, 'POST /api/receipts should return 201');
    const createdReceipt = await createRecRes.json();
    assert.strictEqual(createdReceipt.data.status, 'draft');
    console.log('✓ POST /api/receipts verified');

    // Validate the receipt
    const validateRecRes = await fetch(`${baseUrl}/receipts/${createdReceipt.data.id}/validate`, {
      method: 'POST'
    });
    assert.strictEqual(validateRecRes.status, 200);
    const validatedReceipt = await validateRecRes.json();
    assert.strictEqual(validatedReceipt.data.status, 'done');
    console.log('✓ POST /api/receipts/:id/validate verified');

    // 3. Deliveries Endpoints
    const delRes = await fetch(`${baseUrl}/deliveries`);
    assert.strictEqual(delRes.status, 200);
    const delData = await delRes.json();
    assert(Array.isArray(delData.data));
    console.log(`✓ GET /api/deliveries verified (${delData.data.length} records)`);

    // Create delivery for the received item
    const newDelPayload = {
      referenceNumber: `OUT-API-TEST-${Date.now()}`,
      customerName: 'API Test Client',
      warehouseId: 'WH-MAIN',
      location: 'Store A',
      lines: [
        { productId: 'PROD-API-1', productName: 'API Test Item', quantity: 20, uom: 'units' }
      ]
    };
    const createDelRes = await fetch(`${baseUrl}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newDelPayload)
    });
    assert.strictEqual(createDelRes.status, 201);
    const createdDel = await createDelRes.json();
    console.log('✓ POST /api/deliveries verified');

    // Validate delivery
    const validateDelRes = await fetch(`${baseUrl}/deliveries/${createdDel.data.id}/validate`, {
      method: 'POST'
    });
    assert.strictEqual(validateDelRes.status, 200);
    const validatedDel = await validateDelRes.json();
    assert.strictEqual(validatedDel.data.status, 'done');
    console.log('✓ POST /api/deliveries/:id/validate verified');

    // Test Delivery Shortage Prevention (request 1000 units when only 30 remain)
    const excessDelPayload = {
      referenceNumber: `OUT-EXCESS-${Date.now()}`,
      customerName: 'Excess Buyer',
      warehouseId: 'WH-MAIN',
      location: 'Store A',
      lines: [
        { productId: 'PROD-API-1', productName: 'API Test Item', quantity: 1000, uom: 'units' }
      ]
    };
    const createExcessRes = await fetch(`${baseUrl}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(excessDelPayload)
    });
    const excessDel = await createExcessRes.json();
    const validateExcessRes = await fetch(`${baseUrl}/deliveries/${excessDel.data.id}/validate`, {
      method: 'POST'
    });
    assert.strictEqual(validateExcessRes.status, 400, 'Excess delivery must return 400 Bad Request');
    console.log('✓ Shortage Prevention via HTTP 400 Bad Request verified');

    // 4. Two-Phase Internal Transfers Endpoints
    const newTransferPayload = {
      referenceNumber: `TR-API-TEST-${Date.now()}`,
      fromWarehouseId: 'WH-MAIN',
      fromLocation: 'Store A',
      toWarehouseId: 'WH-SUB',
      toLocation: 'Bay 2',
      lines: [
        { productId: 'PROD-API-1', productName: 'API Test Item', quantity: 15, uom: 'units' }
      ]
    };
    const createTrRes = await fetch(`${baseUrl}/transfers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTransferPayload)
    });
    assert.strictEqual(createTrRes.status, 201);
    const createdTr = await createTrRes.json();
    assert.strictEqual(createdTr.data.status, 'draft');
    console.log('✓ POST /api/transfers verified');

    // Phase 1: Dispatch
    const dispatchTrRes = await fetch(`${baseUrl}/transfers/${createdTr.data.id}/dispatch`, {
      method: 'POST'
    });
    assert.strictEqual(dispatchTrRes.status, 200);
    const dispatchedTr = await dispatchTrRes.json();
    assert.strictEqual(dispatchedTr.data.status, 'in_transit');
    console.log('✓ POST /api/transfers/:id/dispatch (Phase 1) verified');

    // Phase 2: Complete
    const completeTrRes = await fetch(`${baseUrl}/transfers/${createdTr.data.id}/complete`, {
      method: 'POST'
    });
    assert.strictEqual(completeTrRes.status, 200);
    const completedTr = await completeTrRes.json();
    assert.strictEqual(completedTr.data.status, 'done');
    console.log('✓ POST /api/transfers/:id/complete (Phase 2) verified');

    // 5. Stock Adjustments Endpoints
    const adjPayload = {
      productId: 'PROD-API-1',
      warehouseId: 'WH-SUB',
      location: 'Bay 2',
      recordedQuantity: 12, // System had 15, so 3 lost
      reason: 'lost',
      notes: 'API automated test adjustment'
    };
    const createAdjRes = await fetch(`${baseUrl}/stock-adjustments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adjPayload)
    });
    assert.strictEqual(createAdjRes.status, 201);
    const createdAdj = await createAdjRes.json();
    assert.strictEqual(createdAdj.data.delta, -3);
    assert.strictEqual(createdAdj.data.reason, 'lost');
    console.log('✓ POST /api/stock-adjustments verified');

    // 6. Stock Ledger Export Endpoint
    const ledgerRes = await fetch(`${baseUrl}/ledger`);
    assert.strictEqual(ledgerRes.status, 200);
    const ledgerData = await ledgerRes.json();
    assert(Array.isArray(ledgerData.data));
    assert(ledgerData.data.length >= 5, 'Ledger should record all transactional operations');
    console.log(`✓ GET /api/ledger verified (${ledgerData.data.length} audit entries)`);

    console.log('\n=============================================================');
    console.log('✓ ALL MEMBER 3 REST API ENDPOINTS FULLY VERIFIED & OPERATIONAL!');
    console.log('=============================================================\n');
  } finally {
    server.close();
  }
}

runApiTests().catch((err) => {
  console.error('API Test Failure:', err);
  process.exit(1);
});
