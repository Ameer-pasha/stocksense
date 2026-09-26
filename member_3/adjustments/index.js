// Member 3: Adjustments Module Backend Interface
const { adjustmentService, AdjustmentService, ALLOWED_REASONS } = require('./adjustmentService');
const adjustmentController = require('./adjustmentController');
const adjustmentRoutes = require('./adjustmentRoutes');

module.exports = {
  adjustmentService,
  AdjustmentService,
  adjustmentController,
  adjustmentRoutes,
  ALLOWED_REASONS
};
