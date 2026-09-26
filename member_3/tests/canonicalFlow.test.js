// Member 3 Integration Test: Canonical 4-Step Inventory Flow (StockSense.pdf)
// Verifies the exact sequence defined in the Hackathon Problem Statement

const assert = require('assert');
const { OperationsStore } = require('../store/operationsStore');
const { ReceiptService } = require('../receipts/receiptService');
const { TransferService } = require('../transfers/transferService');
const { DeliveryService } = require('../deliveries/deliveryService');
const { AdjustmentService } = require('../adjustments/adjustmentService');

function runCanonicalFlowTest() {
  console.log('================================================================');
  console.log(' Running StockSense.pdf Canonical 4-Step Inventory Lifecycle Test');
  console.log('================================================================');

  const store = new OperationsStore();
  const receiptService = new ReceiptService(store);
  const transferService = new TransferService(store);
  const deliveryService = new DeliveryService(store);
  const adjustmentService = new AdjustmentService(store);

  const locMainStore = 'Rack A (Bulk Steel & Heavy Goods)';
  const locProdRack = 'Rack B (Production Floor Staging)';

  // Initial State: 0 kg in both locations
  assert.strictEqual(store.getLocationStock('prod-001', locMainStore), 0);
  assert.strictEqual(store.getLocationStock('prod-001', locProdRack), 0);
  console.log('[Initial State] Main Store: 0 kg | Production Rack: 0 kg | Total: 0 kg');

  // -------------------------------------------------------------
  // Step 1: Receive Goods from Vendor (Receive 100 kg Steel)
  // -------------------------------------------------------------
  console.log('\n[Step 1] Receiving 100 kg Steel from Tata Steel Works into Main Store...');
  const receipt = receiptService.create({
    supplierName: 'Tata Steel Works',
    warehouseName: 'Main Warehouse',
    locationCode: locMainStore,
    items: [
      { productId: 'prod-001', sku: 'STL-ROD-01', productName: 'Steel Rods', quantityOrdered: 100, unit: 'kg' }
    ]
  });

  receiptService.validate(receipt.id);
  const stockAfterStep1Main = store.getLocationStock('prod-001', locMainStore);
  const stockAfterStep1Prod = store.getLocationStock('prod-001', locProdRack);
  const totalStockAfterStep1 = stockAfterStep1Main + stockAfterStep1Prod;

  assert.strictEqual(stockAfterStep1Main, 100);
  assert.strictEqual(stockAfterStep1Prod, 0);
  assert.strictEqual(totalStockAfterStep1, 100);
  console.log(`-> Step 1 Verified: Main Store: ${stockAfterStep1Main} kg | Prod: ${stockAfterStep1Prod} kg | Total: ${totalStockAfterStep1} kg`);

  // -------------------------------------------------------------
  // Step 2: Internal Transfer to Production Rack (Move 60 kg Steel)
  // -------------------------------------------------------------
  console.log('\n[Step 2] Executing two-phase transfer: 60 kg Steel from Main Store to Production Rack...');
  const transfer = transferService.create({
    sourceLocationCode: locMainStore,
    destLocationCode: locProdRack,
    items: [
      { productId: 'prod-001', sku: 'STL-ROD-01', productName: 'Steel Rods', quantity: 60, unit: 'kg' }
    ]
  });

  // Phase 1: Dispatch
  transferService.confirmDispatch(transfer.id);
  assert.strictEqual(store.getLocationStock('prod-001', locMainStore), 40);
  assert.strictEqual(store.getLocationStock('prod-001', locProdRack), 0);

  // Phase 2: Arrival
  transferService.completeArrival(transfer.id);
  const stockAfterStep2Main = store.getLocationStock('prod-001', locMainStore);
  const stockAfterStep2Prod = store.getLocationStock('prod-001', locProdRack);
  const totalStockAfterStep2 = stockAfterStep2Main + stockAfterStep2Prod;

  assert.strictEqual(stockAfterStep2Main, 40);
  assert.strictEqual(stockAfterStep2Prod, 60);
  assert.strictEqual(totalStockAfterStep2, 100); // INVARIANT: Enterprise stock unchanged!
  console.log(`-> Step 2 Verified: Main Store: ${stockAfterStep2Main} kg | Prod: ${stockAfterStep2Prod} kg | Total: ${totalStockAfterStep2} kg (Unchanged)`);

  // -------------------------------------------------------------
  // Step 3: Deliver Finished Goods to Customer (Deliver 20 kg)
  // -------------------------------------------------------------
  console.log('\n[Step 3] Fulfilling customer delivery: 20 kg from Production Rack...');
  const delivery = deliveryService.create({
    customerName: 'Apex Constructions',
    locationCode: locProdRack,
    items: [
      { productId: 'prod-001', sku: 'STL-ROD-01', productName: 'Steel Rods', quantityOrdered: 20, unit: 'kg' }
    ]
  });

  deliveryService.validate(delivery.id);
  const stockAfterStep3Main = store.getLocationStock('prod-001', locMainStore);
  const stockAfterStep3Prod = store.getLocationStock('prod-001', locProdRack);
  const totalStockAfterStep3 = stockAfterStep3Main + stockAfterStep3Prod;

  assert.strictEqual(stockAfterStep3Main, 40);
  assert.strictEqual(stockAfterStep3Prod, 40);
  assert.strictEqual(totalStockAfterStep3, 80);
  console.log(`-> Step 3 Verified: Main Store: ${stockAfterStep3Main} kg | Prod: ${stockAfterStep3Prod} kg | Total: ${totalStockAfterStep3} kg`);

  // -------------------------------------------------------------
  // Step 4: Adjust Damaged Items (3 kg damaged on production floor)
  // -------------------------------------------------------------
  console.log('\n[Step 4] Auditing production rack: 3 kg damaged (Physical count = 37 kg vs System = 40 kg)...');
  const adjustment = adjustmentService.create({
    productId: 'prod-001',
    locationCode: locProdRack,
    countedQuantity: 37,
    reason: 'damaged',
    remarks: '3 kg damaged during bending operations'
  });

  assert.strictEqual(adjustment.discrepancy, -3);

  const stockAfterStep4Main = store.getLocationStock('prod-001', locMainStore);
  const stockAfterStep4Prod = store.getLocationStock('prod-001', locProdRack);
  const totalStockAfterStep4 = stockAfterStep4Main + stockAfterStep4Prod;

  assert.strictEqual(stockAfterStep4Main, 40);
  assert.strictEqual(stockAfterStep4Prod, 37);
  assert.strictEqual(totalStockAfterStep4, 77);
  console.log(`-> Step 4 Verified: Main Store: ${stockAfterStep4Main} kg | Prod: ${stockAfterStep4Prod} kg | Total: ${totalStockAfterStep4} kg`);

  // -------------------------------------------------------------
  // Final Audit: Verify the 5 Double-Entry Stock Ledger Transactions
  // -------------------------------------------------------------
  console.log('\n[Audit Trail Verification] Inspecting Stock Ledger entries...');
  const ledger = store.getLedger();

  assert.strictEqual(ledger.length, 5);

  // Latest entry is Adjustment (-3 kg)
  assert.strictEqual(ledger[0].documentType, 'ADJUSTMENT');
  assert.strictEqual(ledger[0].quantityChange, -3);

  // 4th entry is Delivery (-20 kg)
  assert.strictEqual(ledger[1].documentType, 'DELIVERY');
  assert.strictEqual(ledger[1].quantityChange, -20);

  // 3rd entry is Transfer In (+60 kg)
  assert.strictEqual(ledger[2].documentType, 'INTERNAL_TRANSFER_IN');
  assert.strictEqual(ledger[2].quantityChange, 60);

  // 2nd entry is Transfer Out (-60 kg)
  assert.strictEqual(ledger[3].documentType, 'INTERNAL_TRANSFER_OUT');
  assert.strictEqual(ledger[3].quantityChange, -60);

  // 1st entry is Receipt (+100 kg)
  assert.strictEqual(ledger[4].documentType, 'RECEIPT');
  assert.strictEqual(ledger[4].quantityChange, 100);

  // Net ledger sum: 100 - 60 + 60 - 20 - 3 = 77 kg
  const netLedgerSum = ledger.reduce((sum, entry) => sum + entry.quantityChange, 0);
  assert.strictEqual(netLedgerSum, 77);
  assert.strictEqual(netLedgerSum, totalStockAfterStep4);

  console.log(`-> Audit Trail Verified! Net ledger sum matches total stock: ${netLedgerSum} kg`);
  console.log('\n================================================================');
  console.log(' SUCCESS: Canonical 4-Step Inventory Flow Fully Validated!');
  console.log('================================================================\n');
}

if (require.main === module) {
  runCanonicalFlowTest();
}

module.exports = runCanonicalFlowTest;
