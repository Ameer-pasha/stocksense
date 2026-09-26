// Member 3: Stock Adjustments HTTP Controller
const { adjustmentService } = require('./adjustmentService');

const adjustmentController = {
  getAllAdjustments: (req, res) => {
    try {
      const { warehouse_id, product_id, reason } = req.query;
      const list = adjustmentService.getAll({ warehouse_id, product_id, reason });
      res.json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getAdjustmentById: (req, res) => {
    try {
      const adjustment = adjustmentService.getById(req.params.id);
      if (!adjustment) {
        return res.status(404).json({ success: false, message: `Adjustment ${req.params.id} not found.` });
      }
      res.json({ success: true, data: adjustment });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  createAdjustment: (req, res) => {
    try {
      const record = adjustmentService.create(req.body);
      res.status(201).json({
        success: true,
        message: `Inventory adjustment ${record.adjustmentNumber} recorded: stock updated and logged in Stock Ledger.`,
        data: record
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
};

module.exports = adjustmentController;
