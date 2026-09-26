// Member 3 Backend Unit Test: Deliveries Operations
const assert = require('assert');
const { DeliveryService } = require('../deliveries/deliveryService');
const { OperationsStore } = require('../store/operationsStore');

function runTest() {
  console.log('--- Testing Member 3: Deliveries Operations ---');
  const store = new OperationsStore();
  const service = new DeliveryService(store);

  // Setup initial stock of 15 chairs in Rack C
  assert.strictEqual(store.getLocationStock('prod-002', 'Rack C (Finished Furniture)'), 15);

  // 1. Create Draft Delivery for 10 chairs
  const delivery = service.create({
    customerName: 'TechCorp HQ',
    warehouseId: 'wh-main',
    warehouseName: 'Main Warehouse',
    locationCode: 'Rack C (Finished Furniture)',
    items: [
      { productId: 'prod-002', sku: 'CHR-ERG-02', productName: 'Office Chair', quantityOrdered: 10, unit: 'pcs' }
    ]
  });

  assert.strictEqual(delivery.status, 'draft');

  // 2. Check Availability
  const audit = service.checkAvailability(delivery.id);
  assert.strictEqual(audit.allAvailable, true);
  assert.strictEqual(audit.items[0].available, 15);
  assert.strictEqual(audit.items[0].requested, 10);
  assert.strictEqual(audit.items[0].shortage, 0);

  // 3. Test Shortage Prevention Gate
  const oversizedDelivery = service.create({
    customerName: 'Mega Corp',
    warehouseId: 'wh-main',
    locationCode: 'Rack C (Finished Furniture)',
    items: [
      { productId: 'prod-002', sku: 'CHR-ERG-02', productName: 'Office Chair', quantityOrdered: 50, unit: 'pcs' }
    ]
  });

  const oversizedAudit = service.checkAvailability(oversizedDelivery.id);
  assert.strictEqual(oversizedAudit.allAvailable, false);
  assert.strictEqual(oversizedAudit.items[0].shortage, 35);

  assert.throws(() => {
    service.validate(oversizedDelivery.id);
  }, /insufficient stock/i);

  // 4. Validate Delivery
  const result = service.validate(delivery.id);
  assert.strictEqual(result.delivery.status, 'done');
  assert.strictEqual(store.getLocationStock('prod-002', 'Rack C (Finished Furniture)'), 5);

  // 5. Verify Ledger Record
  const ledger = store.getLedger();
  assert.strictEqual(ledger.length, 1);
  assert.strictEqual(ledger[0].documentType, 'DELIVERY');
  assert.strictEqual(ledger[0].quantityChange, -10);

  console.log('✓ All Deliveries unit tests passed!');
}

if (require.main === module) {
  runTest();
}

module.exports = runTest;
