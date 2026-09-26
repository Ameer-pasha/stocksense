// Member 3: Receipts Module Backend Interface
const { receiptService, ReceiptService } = require('./receiptService');
const receiptController = require('./receiptController');
const receiptRoutes = require('./receiptRoutes');
const { INITIAL_RECEIPTS } = require('./initialReceipts');

module.exports = {
  receiptService,
  ReceiptService,
  receiptController,
  receiptRoutes,
  INITIAL_RECEIPTS
};
