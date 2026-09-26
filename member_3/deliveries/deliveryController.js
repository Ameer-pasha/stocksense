// Member 3: Deliveries HTTP Controller
const { deliveryService } = require('./deliveryService');

const deliveryController = {
  getAllDeliveries: (req, res) => {
    try {
      const { status, warehouse_id } = req.query;
      const list = deliveryService.getAll({ status, warehouseId: warehouse_id });
      res.json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getDeliveryById: (req, res) => {
    try {
      const delivery = deliveryService.getById(req.params.id);
      if (!delivery) {
        return res.status(404).json({ success: false, message: `Delivery ${req.params.id} not found.` });
      }
      res.json({ success: true, data: delivery });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  checkAvailability: (req, res) => {
    try {
      const audit = deliveryService.checkAvailability(req.params.id);
      res.json({
        success: true,
        data: audit
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  createDelivery: (req, res) => {
    try {
      const delivery = deliveryService.create(req.body);
      res.status(201).json({
        success: true,
        message: `Delivery order ${delivery.deliveryNumber} created in draft state.`,
        data: delivery
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  updateStatus: (req, res) => {
    try {
      const { status } = req.body;
      const delivery = deliveryService.updateStatus(req.params.id, status);
      res.json({
        success: true,
        message: `Delivery status updated to ${status}.`,
        data: delivery
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  validateDelivery: (req, res) => {
    try {
      const result = deliveryService.validate(req.params.id);
      res.json({
        success: true,
        message: `Delivery ${result.delivery.deliveryNumber} dispatched and stock decremented.`,
        data: {
          ...result.delivery,
          processedItems: result.processedItems
        },
        delivery: result.delivery,
        processedItems: result.processedItems
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  cancelDelivery: (req, res) => {
    try {
      const delivery = deliveryService.cancel(req.params.id);
      res.json({
        success: true,
        message: `Delivery order ${delivery.deliveryNumber} cancelled.`,
        data: delivery
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = deliveryController;
