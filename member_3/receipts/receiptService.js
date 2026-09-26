// Member 3: Receipts Business Logic Service
// Manages Inbound Supplier PO Intake, Receipt Validation, Stock Increments, and Ledger Logging

const { operationsStore } = require('../store/operationsStore');

class ReceiptService {
  constructor(store = operationsStore) {
    this.store = store;
  }

  getAll({ status, warehouseId } = {}) {
    let list = [...this.store.receipts];
    if (status) {
      list = list.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }
    if (warehouseId) {
      list = list.filter(r => r.warehouseId === warehouseId);
    }
    return list;
  }

  getById(receiptId) {
    return this.store.receipts.find(r => r.id === receiptId || r.receiptNumber === receiptId) || null;
  }

  create({
    supplierName,
    warehouseId = 'wh-main',
    warehouseName = 'Main Warehouse',
    locationCode,
    location,
    receiptDate = new Date().toISOString().split('T')[0],
    notes = '',
    createdBy = 'Prince (Inventory Staff)',
    items = [],
    lines = []
  }) {
    const finalLocation = locationCode || location || 'Rack A (Bulk Steel & Heavy Goods)';
    const rawItems = (Array.isArray(items) && items.length > 0) ? items : (Array.isArray(lines) ? lines : []);
    if (!supplierName || !supplierName.trim()) {
      throw new Error('Supplier name is required.');
    }
    if (rawItems.length === 0) {
      throw new Error('Receipt must contain at least one line item.');
    }

    // Validate item lines
    for (const item of rawItems) {
      if (!item.productId) {
        throw new Error('Each item must have a valid productId.');
      }
      const qty = Number(item.quantity || item.quantityOrdered || item.quantityReceived || 0);
      if (qty <= 0) {
        throw new Error(`Invalid quantity ${qty} for item ${item.productId}. Must be greater than 0.`);
      }
    }

    const nextNum = (this.store.receipts.length + 1).toString().padStart(3, '0');
    const receiptNumber = `REC-${new Date().getFullYear()}-${nextNum}`;

    const newReceipt = {
      id: receiptNumber,
      receiptNumber,
      supplierName: supplierName.trim(),
      warehouseId,
      warehouseName,
      locationCode: finalLocation,
      receiptDate,
      status: 'draft',
      notes: notes.trim(),
      createdBy,
      items: rawItems.map(item => {
        const qty = Number(item.quantity || item.quantityOrdered || item.quantityReceived || 0);
        return {
          productId: item.productId,
          sku: item.sku || item.productId,
          productName: item.productName || item.sku || 'Item',
          quantityOrdered: qty,
          quantityReceived: qty,
          unit: item.unit || item.uom || 'pcs',
          unitPrice: Number(item.unitPrice) || 0
        };
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store.receipts.unshift(newReceipt);
    return newReceipt;
  }

  validate(receiptId) {
    const receipt = this.getById(receiptId);
    if (!receipt) {
      throw new Error(`Receipt ${receiptId} not found.`);
    }
    if (receipt.status === 'done') {
      throw new Error(`Receipt ${receipt.receiptNumber} has already been validated.`);
    }
    if (receipt.status === 'cancelled') {
      throw new Error(`Cannot validate cancelled receipt ${receipt.receiptNumber}.`);
    }

    const processedItems = [];

    // Atomically increment stock for each item in the location & record ledger entry
    for (const item of receipt.items) {
      const qtyToAdd = Number(item.quantityReceived || item.quantityOrdered || 0);
      if (qtyToAdd <= 0) continue;

      const currentStock = this.store.getLocationStock(item.productId, receipt.locationCode);
      const newStock = currentStock + qtyToAdd;

      // Update physical location stock
      this.store.updateLocationStock(item.productId, receipt.locationCode, newStock);

      // Record double-entry ledger entry
      const ledgerEntry = this.store.recordLedgerEntry({
        documentType: 'RECEIPT',
        documentRef: receipt.receiptNumber,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        sourceLocation: `Vendor: ${receipt.supplierName}`,
        destLocation: `${receipt.warehouseName} - ${receipt.locationCode}`,
        quantityChange: +qtyToAdd,
        unit: item.unit,
        reason: `Goods receipt note validated: ${receipt.notes || 'Inbound supplier PO delivery'}`,
        performedBy: receipt.createdBy
      });

      processedItems.push({
        productId: item.productId,
        sku: item.sku,
        stockBefore: currentStock,
        stockAfter: newStock,
        quantityAdded: qtyToAdd,
        ledgerId: ledgerEntry.id
      });
    }

    receipt.status = 'done';
    receipt.validatedAt = new Date().toISOString();
    receipt.updatedAt = new Date().toISOString();

    return {
      receipt,
      processedItems
    };
  }

  cancel(receiptId) {
    const receipt = this.getById(receiptId);
    if (!receipt) {
      throw new Error(`Receipt ${receiptId} not found.`);
    }
    if (receipt.status === 'done') {
      throw new Error(`Cannot cancel a validated receipt.`);
    }

    receipt.status = 'cancelled';
    receipt.updatedAt = new Date().toISOString();
    return receipt;
  }
}

const receiptService = new ReceiptService();
module.exports = { receiptService, ReceiptService };
