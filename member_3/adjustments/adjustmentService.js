// Member 3: Stock Adjustments Business Logic Service
// Reconciles Physical Count vs System Count, enforces valid reason codes, updates stock, and logs to Stock Ledger

const { operationsStore } = require('../store/operationsStore');

const ALLOWED_REASONS = ['damaged', 'lost', 'found', 'miscount', 'expired', 'theft', 'audit'];

class AdjustmentService {
  constructor(store = operationsStore) {
    this.store = store;
  }

  getAll({ warehouse_id, product_id, reason } = {}) {
    let list = [...this.store.adjustments];
    if (warehouse_id) {
      list = list.filter(a => a.warehouseId === warehouse_id);
    }
    if (product_id) {
      list = list.filter(a => a.productId === product_id);
    }
    if (reason) {
      list = list.filter(a => a.reason.toLowerCase() === reason.toLowerCase());
    }
    return list;
  }

  getById(adjustmentId) {
    return this.store.adjustments.find(a => a.id === adjustmentId) || null;
  }

  create({
    productId,
    warehouseId = 'wh-main',
    warehouseName = 'Main Warehouse',
    locationCode,
    location,
    countedQuantity,
    physicalStock,
    physicalCount,
    recordedQuantity,
    reason,
    remarks = '',
    notes = '',
    auditedBy = 'Tarun (Inventory Lead)'
  }) {
    if (!productId) {
      throw new Error('Product ID is required.');
    }
    const finalLoc = locationCode || location || 'Rack A (Bulk Steel & Heavy Goods)';
    const finalCount = countedQuantity !== undefined ? countedQuantity :
      (physicalStock !== undefined ? physicalStock :
      (physicalCount !== undefined ? physicalCount :
      (recordedQuantity !== undefined ? recordedQuantity : undefined)));

    if (finalCount === undefined || finalCount === null || isNaN(finalCount)) {
      throw new Error('Valid physical counted quantity is required.');
    }
    if (!reason || !ALLOWED_REASONS.includes(reason.toLowerCase())) {
      throw new Error(`Invalid adjustment reason "${reason}". Allowed reasons: ${ALLOWED_REASONS.join(', ')}.`);
    }

    let product = this.store.getProduct(productId);
    if (!product) {
      product = {
        id: productId,
        sku: productId,
        name: productId,
        unitOfMeasure: 'pcs',
        locations: []
      };
      this.store.products.push(product);
    }

    const currentSystemQuantity = this.store.getLocationStock(productId, finalLoc);
    const counted = Math.max(0, Number(finalCount));
    const discrepancy = counted - currentSystemQuantity;
    const finalRemarks = (remarks || notes || '').trim();

    const nextNum = (this.store.adjustments.length + 1).toString().padStart(3, '0');
    const adjustmentNumber = `ADJ-${new Date().getFullYear()}-${nextNum}`;

    // 1. Update physical inventory to the counted quantity
    this.store.updateLocationStock(productId, finalLoc, counted);

    // 2. Emit double-entry Stock Ledger record
    const ledgerEntry = this.store.recordLedgerEntry({
      documentType: 'ADJUSTMENT',
      documentRef: adjustmentNumber,
      productId,
      sku: product.sku,
      productName: product.name,
      sourceLocation: `${warehouseName} - ${finalLoc}`,
      destLocation: discrepancy >= 0 ? 'Inventory Gain' : 'Inventory Loss / Scrap',
      quantityChange: discrepancy,
      unit: product.unitOfMeasure || 'pcs',
      reason: `Physical count reconciliation (${reason.toLowerCase()}): ${remarks || 'Discrepancy audited'}`,
      performedBy: auditedBy
    });

    const adjustmentRecord = {
      id: adjustmentNumber,
      adjustmentNumber,
      timestamp: new Date().toISOString(),
      productId,
      sku: product.sku,
      productName: product.name,
      warehouseId,
      warehouseName,
      locationCode: finalLoc,
      recordedQuantity: currentSystemQuantity,
      countedQuantity: counted,
      discrepancy,
      delta: discrepancy,
      unit: product.unitOfMeasure || 'pcs',
      reason: reason.toLowerCase(),
      remarks: finalRemarks,
      auditedBy,
      ledgerId: ledgerEntry.id
    };

    this.store.adjustments.unshift(adjustmentRecord);
    return adjustmentRecord;
  }
}

const adjustmentService = new AdjustmentService();
module.exports = { adjustmentService, AdjustmentService, ALLOWED_REASONS };
