// Member 3: Deliveries Module Backend Interface
const { deliveryService, DeliveryService } = require('./deliveryService');
const deliveryController = require('./deliveryController');
const deliveryRoutes = require('./deliveryRoutes');
const { INITIAL_DELIVERIES } = require('./initialDeliveries');

module.exports = {
  deliveryService,
  DeliveryService,
  deliveryController,
  deliveryRoutes,
  INITIAL_DELIVERIES
};
