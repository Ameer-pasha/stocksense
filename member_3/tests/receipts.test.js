// Member 3 Backend Unit Test: Receipts Operations
const assert = require('assert');
const { ReceiptService } = require('../receipts/receiptService');
const { OperationsStore } = require('../store/operationsStore');

function runTest() {
  console.log('--- Testing Member 3: Receipts Operations ---');
  const store = new OperationsStore();
  const service = new ReceiptService(store);

  // Initial stock should be 0
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack A (Bulk Steel & Heavy Goods)'), 0);

  // 1. Create Draft Receipt
  const receipt = service.create({
    supplierName: 'Tata Steel Works',
    warehouseId: 'wh-main',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack A (Bulk Steel & Heavy Goods)',
    items: [
      { productId: 'prod-001', sku: 'STL-ROD-01', productName: 'Steel Rods', quantityOrdered: 100, unit: 'kg' }
    ]
  });

  assert.ok(receipt.receiptNumber.startsWith('REC-'));
  assert.strictEqual(receipt.status, 'draft');
  assert.strictEqual(receipt.items[0].quantityOrdered, 100);

  // Stock should not change before validation
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack A (Bulk Steel & Heavy Goods)'), 0);

  // 2. Validate Receipt
  const result = service.validate(receipt.id);
  assert.strictEqual(result.receipt.status, 'done');
  assert.strictEqual(store.getLocationStock('prod-001', 'Rack A (Bulk Steel & Heavy Goods)'), 100);

  // 3. Verify Stock Ledger Entry
  const ledger = store.getLedger();
  assert.strictEqual(ledger.length, 1);
  assert.strictEqual(ledger[0].documentType, 'RECEIPT');
  assert.strictEqual(ledger[0].quantityChange, 100);
  assert.strictEqual(ledger[0].destLocation, 'Main Warehouse - Rack A (Bulk Steel & Heavy Goods)');

  // 4. Double validation prevention
  assert.throws(() => {
    service.validate(receipt.id);
  }, /already been validated/);

  console.log('✓ All Receipts unit tests passed!');
}

if (require.main === module) {
  runTest();
}

module.exports = runTest;
