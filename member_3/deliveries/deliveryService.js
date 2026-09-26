// Member 3: Deliveries Business Logic Service
// Manages Customer Sales Dispatches, Shortage Audits, Stock Decrements, and Ledger Logging

const { operationsStore } = require('../store/operationsStore');

class DeliveryService {
  constructor(store = operationsStore) {
    this.store = store;
  }

  getAll({ status, warehouseId } = {}) {
    let list = [...this.store.deliveries];
    if (status) {
      list = list.filter(d => d.status.toLowerCase() === status.toLowerCase());
    }
    if (warehouseId) {
      list = list.filter(d => d.warehouseId === warehouseId);
    }
    return list;
  }

  getById(deliveryId) {
    return this.store.deliveries.find(d => d.id === deliveryId || d.deliveryNumber === deliveryId) || null;
  }

  create({
    customerName,
    warehouseId = 'wh-main',
    warehouseName = 'Main Warehouse',
    locationCode,
    location,
    deliveryDate = new Date().toISOString().split('T')[0],
    notes = '',
    createdBy = 'Prince (Shipping Staff)',
    items = [],
    lines = []
  }) {
    const finalLocation = locationCode || location || 'Rack A (Bulk Steel & Heavy Goods)';
    const rawItems = (Array.isArray(items) && items.length > 0) ? items : (Array.isArray(lines) ? lines : []);
    if (!customerName || !customerName.trim()) {
      throw new Error('Customer name is required.');
    }
    if (rawItems.length === 0) {
      throw new Error('Delivery order must contain at least one line item.');
    }

    for (const item of rawItems) {
      if (!item.productId) {
        throw new Error('Each item must have a valid productId.');
      }
      const qty = Number(item.quantity || item.quantityOrdered || item.quantityDelivered || 0);
      if (qty <= 0) {
        throw new Error(`Invalid quantity ${qty} for item ${item.productId}. Must be greater than 0.`);
      }
    }

    const nextNum = (this.store.deliveries.length + 1).toString().padStart(3, '0');
    const deliveryNumber = `DEL-${new Date().getFullYear()}-${nextNum}`;

    const newDelivery = {
      id: deliveryNumber,
      deliveryNumber,
      customerName: customerName.trim(),
      warehouseId,
      warehouseName,
      locationCode: finalLocation,
      deliveryDate,
      status: 'draft',
      notes: notes.trim(),
      createdBy,
      items: rawItems.map(item => {
        const qty = Number(item.quantity || item.quantityOrdered || item.quantityDelivered || 0);
        return {
          productId: item.productId,
          sku: item.sku || item.productId,
          productName: item.productName || item.sku || 'Item',
          quantityOrdered: qty,
          quantityDelivered: qty,
          unit: item.unit || item.uom || 'pcs'
        };
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store.deliveries.unshift(newDelivery);
    return newDelivery;
  }

  checkAvailability(deliveryId) {
    const delivery = this.getById(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found.`);
    }

    let allAvailable = true;
    const auditedItems = delivery.items.map(item => {
      const locationStock = this.store.getLocationStock(item.productId, delivery.locationCode);
      const requested = Number(item.quantityOrdered || item.quantityDelivered || 0);
      const isAvailable = locationStock >= requested;

      if (!isAvailable) {
        allAvailable = false;
      }

      return {
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        requested,
        available: locationStock,
        shortage: Math.max(0, requested - locationStock),
        isAvailable,
        unit: item.unit
      };
    });

    return {
      deliveryId: delivery.id,
      deliveryNumber: delivery.deliveryNumber,
      locationCode: delivery.locationCode,
      allAvailable,
      items: auditedItems
    };
  }

  updateStatus(deliveryId, newStatus) {
    const delivery = this.getById(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found.`);
    }
    const allowed = ['draft', 'picking', 'packing', 'ready'];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid stage "${newStatus}". Use validate() to mark delivery as done.`);
    }

    delivery.status = newStatus;
    delivery.updatedAt = new Date().toISOString();
    return delivery;
  }

  validate(deliveryId) {
    const delivery = this.getById(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found.`);
    }
    if (delivery.status === 'done') {
      throw new Error(`Delivery ${delivery.deliveryNumber} has already been dispatched.`);
    }
    if (delivery.status === 'cancelled') {
      throw new Error(`Cannot validate cancelled delivery ${delivery.deliveryNumber}.`);
    }

    // 1. Enforce Shortage Prevention Gate
    const audit = this.checkAvailability(delivery.id);
    if (!audit.allAvailable) {
      const shortages = audit.items
        .filter(i => !i.isAvailable)
        .map(i => `${i.productName} (Short by ${i.shortage} ${i.unit})`)
        .join(', ');
      throw new Error(`Cannot dispatch delivery due to insufficient stock in ${delivery.locationCode}: ${shortages}`);
    }

    const processedItems = [];

    // 2. Atomically decrement stock from origin location & record ledger entry
    for (const item of delivery.items) {
      const qtyToDeduct = Number(item.quantityOrdered || item.quantityDelivered || 0);
      if (qtyToDeduct <= 0) continue;

      const currentStock = this.store.getLocationStock(item.productId, delivery.locationCode);
      const newStock = Math.max(0, currentStock - qtyToDeduct);

      // Update physical location stock
      this.store.updateLocationStock(item.productId, delivery.locationCode, newStock);

      // Record double-entry ledger entry
      const ledgerEntry = this.store.recordLedgerEntry({
        documentType: 'DELIVERY',
        documentRef: delivery.deliveryNumber,
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        sourceLocation: `${delivery.warehouseName} - ${delivery.locationCode}`,
        destLocation: `Customer: ${delivery.customerName}`,
        quantityChange: -qtyToDeduct,
        unit: item.unit,
        reason: `Sales order fulfilled & dispatched: ${delivery.notes || 'Goods issued to customer'}`,
        performedBy: delivery.createdBy
      });

      processedItems.push({
        productId: item.productId,
        sku: item.sku,
        stockBefore: currentStock,
        stockAfter: newStock,
        quantityDeducted: qtyToDeduct,
        ledgerId: ledgerEntry.id
      });
    }

    delivery.status = 'done';
    delivery.dispatchedAt = new Date().toISOString();
    delivery.updatedAt = new Date().toISOString();

    return {
      delivery,
      processedItems
    };
  }

  cancel(deliveryId) {
    const delivery = this.getById(deliveryId);
    if (!delivery) {
      throw new Error(`Delivery ${deliveryId} not found.`);
    }
    if (delivery.status === 'done') {
      throw new Error(`Cannot cancel an already completed delivery order.`);
    }

    delivery.status = 'cancelled';
    delivery.updatedAt = new Date().toISOString();
    return delivery;
  }
}

const deliveryService = new DeliveryService();
module.exports = { deliveryService, DeliveryService };
