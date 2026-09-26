// Member 3 Backend Unit Test: Stock Adjustments
const assert = require('assert');
const { AdjustmentService } = require('../adjustments/adjustmentService');
const { OperationsStore } = require('../store/operationsStore');

function runTest() {
  console.log('--- Testing Member 3: Stock Adjustments ---');
  const store = new OperationsStore();
  const service = new AdjustmentService(store);

  // Set initial stock to 40 kg
  store.updateLocationStock('prod-001', 'Rack B (Production Floor Staging)', 40);

  // 1. Invalid reason code rejected
  assert.throws(() => {
    service.create({
      productId: 'prod-001',
      locationCode: 'Rack B (Production Floor Staging)',
      countedQuantity: 37,
      reason: 'alien_abduction'
    });
  }, /invalid adjustment reason/i);

  // 2. Execute Negative Discrepancy Adjustment (Damaged goods: 37 counted vs 40 system -> delta -3)
  const adjustment = service.create({
    productId: 'prod-001',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack B (Production Floor Staging)',
    countedQuantity: 37,
    reason: 'damaged',
    remarks: '3 kg bent rods discovered during physical inspection',
    auditedBy: 'Tarun (Inventory Lead)'
  });

  assert.strictEqual(adjustment.recordedQuantity, 40);
  assert.strictEqual(adjustment.countedQuantity, 37);
  assert.strictEqual(adjustment.discrepancy, -3);
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack B (Production Floor Staging)'), 37);

  // 3. Verify Stock Ledger Entry
  const ledger = store.getLedger();
  assert.strictEqual(ledger.length, 1);
  assert.strictEqual(ledger[0].documentType, 'ADJUSTMENT');
  assert.strictEqual(ledger[0].quantityChange, -3);
  assert.ok(ledger[0].reason.includes('damaged'));

  // 4. Execute Positive Discrepancy Adjustment (Found surplus stock)
  const surplusAdj = service.create({
    productId: 'prod-001',
    locationCode: 'Rack B (Production Floor Staging)',
    countedQuantity: 42,
    reason: 'found',
    remarks: 'Found 5 extra kg in adjacent bin'
  });

  assert.strictEqual(surplusAdj.discrepancy, 5);
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack B (Production Floor Staging)'), 42);

  console.log('✓ All Stock Adjustments unit tests passed!');
}

if (require.main === module) {
  runTest();
}

module.exports = runTest;
