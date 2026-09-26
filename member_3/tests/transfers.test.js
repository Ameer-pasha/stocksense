// Member 3 Backend Unit Test: Internal Transfers (Two-Phase Commit)
const assert = require('assert');
const { TransferService } = require('../transfers/transferService');
const { OperationsStore } = require('../store/operationsStore');

function runTest() {
  console.log('--- Testing Member 3: Internal Transfers (Two-Phase Commit) ---');
  const store = new OperationsStore();
  const service = new TransferService(store);

  // Set initial stock of 100 kg in Rack A, 0 kg in Rack B
  store.updateLocationStock('prod-001', 'Rack A (Bulk Steel & Heavy Goods)', 100);
  store.updateLocationStock('prod-001', 'Rack B (Production Floor Staging)', 0);

  // 1. Validation: Identical origin & destination rejected
  assert.throws(() => {
    service.create({
      sourceWarehouseId: 'wh-main',
      sourceLocationCode: 'Rack A',
      destWarehouseId: 'wh-main',
      destLocationCode: 'Rack A',
      items: [{ productId: 'prod-001', quantity: 50 }]
    });
  }, /cannot be identical/i);

  // 2. Create Draft Transfer (60 kg)
  const transfer = service.create({
    sourceWarehouseId: 'wh-main',
    sourceWarehouseName: 'Main Warehouse',
    sourceLocationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    destWarehouseId: 'wh-main',
    destWarehouseName: 'Main Warehouse',
    destLocationCode: 'Rack B (Production Floor Staging)',
    items: [
      { productId: 'prod-001', sku: 'STL-ROD-01', productName: 'Steel Rods', quantity: 60, unit: 'kg' }
    ]
  });

  assert.strictEqual(transfer.status, 'draft');

  // 3. Phase 1: Confirm Dispatch
  const dispatchResult = service.confirmDispatch(transfer.id);
  assert.strictEqual(dispatchResult.transfer.status, 'in_transit');
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack A (Bulk Steel & Heavy Goods)'), 40);
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack B (Production Floor Staging)'), 0);

  // Check transfer_out ledger
  const ledgerAfterDispatch = store.getLedger();
  assert.strictEqual(ledgerAfterDispatch.length, 1);
  assert.strictEqual(ledgerAfterDispatch[0].documentType, 'INTERNAL_TRANSFER_OUT');
  assert.strictEqual(ledgerAfterDispatch[0].quantityChange, -60);

  // 4. Phase 2: Complete Arrival
  const arrivalResult = service.completeArrival(transfer.id);
  assert.strictEqual(arrivalResult.transfer.status, 'done');
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack A (Bulk Steel & Heavy Goods)'), 40);
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack B (Production Floor Staging)'), 60);

  // Check transfer_in ledger
  const ledgerAfterArrival = store.getLedger();
  assert.strictEqual(ledgerAfterArrival.length, 2);
  assert.strictEqual(ledgerAfterArrival[0].documentType, 'INTERNAL_TRANSFER_IN');
  assert.strictEqual(ledgerAfterArrival[0].quantityChange, 60);

  // Invariant verification: Total stock remains 100 kg
  const totalStock = store.getLocationStock('prod-001', 'Rack A (Bulk Steel & Heavy Goods)') +
                     store.getLocationStock('prod-001', 'Rack B (Production Floor Staging)');
  assert.strictEqual(totalStock, 100);

  console.log('✓ All Internal Transfers unit tests passed!');
}

if (require.main === module) {
  runTest();
}

module.exports = runTest;
