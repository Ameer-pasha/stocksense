// Member 3: Transfers HTTP Controller
const { transferService } = require('./transferService');

const transferController = {
  getAllTransfers: (req, res) => {
    try {
      const { status, from_warehouse, to_warehouse } = req.query;
      const list = transferService.getAll({ status, from_warehouse, to_warehouse });
      res.json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getTransferById: (req, res) => {
    try {
      const transfer = transferService.getById(req.params.id);
      if (!transfer) {
        return res.status(404).json({ success: false, message: `Transfer ${req.params.id} not found.` });
      }
      res.json({ success: true, data: transfer });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createTransfer: (req, res) => {
    try {
      const transfer = transferService.create(req.body);
      res.status(201).json({
        success: true,
        message: `Internal transfer ${transfer.transferNumber} scheduled in draft state.`,
        data: transfer
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  confirmDispatch: (req, res) => {
    try {
      const result = transferService.confirmDispatch(req.params.id);
      res.json({
        success: true,
        message: `Transfer ${result.transfer.transferNumber} dispatched: stock deducted from origin and logged as transfer_out.`,
        data: {
          ...result.transfer,
          processedItems: result.processedItems
        },
        transfer: result.transfer,
        processedItems: result.processedItems
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  completeArrival: (req, res) => {
    try {
      const result = transferService.completeArrival(req.params.id);
      res.json({
        success: true,
        message: `Transfer ${result.transfer.transferNumber} completed: stock credited to destination and logged as transfer_in.`,
        data: {
          ...result.transfer,
          processedItems: result.processedItems
        },
        transfer: result.transfer,
        processedItems: result.processedItems
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  },

  cancelTransfer: (req, res) => {
    try {
      const transfer = transferService.cancel(req.params.id);
      res.json({
        success: true,
        message: `Transfer order ${transfer.transferNumber} cancelled.`,
        data: transfer
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = transferController;
