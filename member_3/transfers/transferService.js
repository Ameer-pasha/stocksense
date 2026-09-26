// Member 3: Internal Transfers Business Logic Service
// Manages Inter & Intra-Warehouse Movements via Two-Phase Commit Protocol
// Phase 1: Confirm Dispatch (decrements origin, logs transfer_out, status -> in_transit)
// Phase 2: Complete Arrival (increments destination, logs transfer_in, status -> done)

const { operationsStore } = require('../store/operationsStore');

class TransferService {
  constructor(store = operationsStore) {
    this.store = store;
  }

  getAll({ status, from_warehouse, to_warehouse } = {}) {
    let list = [...this.store.transfers];
    if (status) {
      list = list.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (from_warehouse) {
      list = list.filter(t => t.sourceWarehouseId === from_warehouse);
    }
    if (to_warehouse) {
      list = list.filter(t => t.destWarehouseId === to_warehouse);
    }
    return list;
  }

  getById(transferId) {
    return this.store.transfers.find(t => t.id === transferId || t.transferNumber === transferId) || null;
  }

  create({
    sourceWarehouseId,
    fromWarehouseId,
    sourceWarehouseName = 'Main Warehouse',
    sourceLocationCode,
    fromLocation,
    destWarehouseId,
    toWarehouseId,
    destWarehouseName = 'Main Warehouse',
    destLocationCode,
    toLocation,
    scheduledDate = new Date().toISOString().split('T')[0],
    notes = '',
    createdBy = 'Ameer (Warehouse Staff)',
    items = [],
    lines = []
  }) {
    const srcWh = sourceWarehouseId || fromWarehouseId || 'wh-main';
    const srcLoc = sourceLocationCode || fromLocation || 'Rack A (Bulk Steel & Heavy Goods)';
    const dstWh = destWarehouseId || toWarehouseId || 'wh-main';
    const dstLoc = destLocationCode || toLocation || 'Rack B (Production Floor Staging)';

    if (srcWh === dstWh && srcLoc === dstLoc) {
      throw new Error('Source and destination locations cannot be identical.');
    }
    const rawItems = (Array.isArray(items) && items.length > 0) ? items : (Array.isArray(lines) ? lines : []);
    if (rawItems.length === 0) {
      throw new Error('Transfer order must contain at least one line item.');
    }

    for (const item of rawItems) {
      if (!item.productId) {
        throw new Error('Each item must have a valid productId.');
      }
      const qty = Number(item.quantity || item.quantityRequested || 0);
      if (qty <= 0) {
        throw new Error(`Invalid transfer quantity ${qty} for item ${item.productId}. Must be greater than 0.`);
      }
    }

    const nextNum = (this.store.transfers.length + 1).toString().padStart(3, '0');
    const transferNumber = `TRF-${new Date().getFullYear()}-${nextNum}`;

    const newTransfer = {
      id: transferNumber,
      transferNumber,
      sourceWarehouseId: srcWh,
      sourceWarehouseName,
      sourceLocationCode: srcLoc,
      destWarehouseId: dstWh,
      destWarehouseName,
      destLocationCode: dstLoc,
      scheduledDate,
      status: 'draft',
      notes: notes.trim(),
      createdBy,
      items: rawItems.map(item => ({
        productId: item.productId,
        sku: item.sku || item.productId,
        productName: item.productName || item.sku || 'Item',
        quantity: Number(item.quantity || item.quantityRequested),
        unit: item.unit || item.uom || 'pcs'
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store.transfers.unshift(newTransfer);
    return newTransfer;
  }

  // Phase 1: Confirm Dispatch
  confirmDispatch(transferId) {
    const transfer = this.getById(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found.`);
    }
    if (transfer.status !== 'draft') {
      throw new Error(`Cannot dispatch transfer with status "${transfer.status}". Transfer must be in draft status.`);
    }

    // Verify stock availability at source
    for (const item of transfer.items) {
      const available = this.store.getLocationStock(item.productId, transfer.sourceLocationCode);
      const requested = Number(item.quantity);
      if (available < requested) {
        throw new Error(`Insufficient stock in ${transfer.sourceLocationCode} for ${item.productName}. Available: ${available}, Required: ${requested}`);
      }
    }

    const processedItems = [];

    // Decrement source location stock and log transfer_out
    for (const item of transfer.items) {
      const qty = Number(item.quantity);
      const currentStock = this.store.getLocationStock(item.productId, transfer.sourceLocationCode);
      const newStock = currentStock - qty;

      this.store.updateLocationStock(item.productId, transfer.sourceLocationCode, newStock);

      const ledgerEntry = this.store.recordLedgerEntry({
        documentType: 'INTERNAL_TRANSFER_OUT',
        documentRef: transfer.transferNumber,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        sourceLocation: `${transfer.sourceWarehouseName} - ${transfer.sourceLocationCode}`,
        destLocation: `In-Transit (${transfer.destWarehouseName})`,
        quantityChange: -qty,
        unit: item.unit,
        reason: `Transfer dispatched: ${transfer.notes || 'Internal stock relocation'}`,
        performedBy: transfer.createdBy
      });

      processedItems.push({
        productId: item.productId,
        sku: item.sku,
        sourceStockBefore: currentStock,
        sourceStockAfter: newStock,
        quantityMoved: qty,
        ledgerId: ledgerEntry.id
      });
    }

    transfer.status = 'in_transit';
    transfer.dispatchedAt = new Date().toISOString();
    transfer.updatedAt = new Date().toISOString();

    return {
      transfer,
      phase: 'dispatch',
      processedItems
    };
  }

  // Phase 2: Complete Arrival
  completeArrival(transferId) {
    const transfer = this.getById(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found.`);
    }
    if (transfer.status !== 'in_transit') {
      throw new Error(`Cannot complete transfer with status "${transfer.status}". Transfer must be in_transit.`);
    }

    const processedItems = [];

    // Increment destination location stock and log transfer_in
    for (const item of transfer.items) {
      const qty = Number(item.quantity);
      const currentStock = this.store.getLocationStock(item.productId, transfer.destLocationCode);
      const newStock = currentStock + qty;

      this.store.updateLocationStock(item.productId, transfer.destLocationCode, newStock);

      const ledgerEntry = this.store.recordLedgerEntry({
        documentType: 'INTERNAL_TRANSFER_IN',
        documentRef: transfer.transferNumber,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        sourceLocation: `In-Transit (${transfer.sourceWarehouseName})`,
        destLocation: `${transfer.destWarehouseName} - ${transfer.destLocationCode}`,
        quantityChange: +qty,
        unit: item.unit,
        reason: `Transfer arrived & shelved: ${transfer.notes || 'Goods verified at destination'}`,
        performedBy: transfer.createdBy
      });

      processedItems.push({
        productId: item.productId,
        sku: item.sku,
        destStockBefore: currentStock,
        destStockAfter: newStock,
        quantityCredited: qty,
        ledgerId: ledgerEntry.id
      });
    }

    transfer.status = 'done';
    transfer.arrivedAt = new Date().toISOString();
    transfer.updatedAt = new Date().toISOString();

    return {
      transfer,
      phase: 'arrival',
      processedItems
    };
  }

  cancel(transferId) {
    const transfer = this.getById(transferId);
    if (!transfer) {
      throw new Error(`Transfer ${transferId} not found.`);
    }
    if (transfer.status === 'done') {
      throw new Error(`Cannot cancel a transfer that has already been completed.`);
    }
    if (transfer.status === 'in_transit') {
      throw new Error(`Cannot cancel a transfer currently in transit. Please complete receipt at destination.`);
    }

    transfer.status = 'cancelled';
    transfer.updatedAt = new Date().toISOString();
    return transfer;
  }
}

const transferService = new TransferService();
module.exports = { transferService, TransferService };
