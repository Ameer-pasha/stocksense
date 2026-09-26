// Member 3: Receipts HTTP Controller
const { receiptService } = require('./receiptService');

const receiptController = {
  getAllReceipts: (req, res) => {
    try {
      const { status, warehouse_id } = req.query;
      const list = receiptService.getAll({ status, warehouseId: warehouse_id });
      res.json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getReceiptById: (req, res) => {
    try {
      const receipt = receiptService.getById(req.params.id);
      if (!receipt) {
        return res.status(404).json({ success: false, message: `Receipt ${req.params.id} not found.` });
      }
      res.json({ success: true, data: receipt });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createReceipt: (req, res) => {
    try {
      const receipt = receiptService.create(req.body);
      res.status(201).json({
        success: true,
        message: `Inbound receipt ${receipt.receiptNumber} created in draft state.`,
        data: receipt
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  validateReceipt: (req, res) => {
    try {
      const result = receiptService.validate(req.params.id);
      res.json({
        success: true,
        message: `Receipt ${result.receipt.receiptNumber} validated and physical stock incremented.`,
        data: {
          ...result.receipt,
          processedItems: result.processedItems
        },
        receipt: result.receipt,
        processedItems: result.processedItems
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  cancelReceipt: (req, res) => {
    try {
      const receipt = receiptService.cancel(req.params.id);
      res.json({
        success: true,
        message: `Receipt ${receipt.receiptNumber} cancelled.`,
        data: receipt
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = receiptController;
