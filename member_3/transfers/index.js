// Member 3: Transfers Module Backend Interface
const { transferService, TransferService } = require('./transferService');
const transferController = require('./transferController');
const transferRoutes = require('./transferRoutes');
const { INITIAL_TRANSFERS } = require('./initialTransfers');

module.exports = {
  transferService,
  TransferService,
  transferController,
  transferRoutes,
  INITIAL_TRANSFERS
};
