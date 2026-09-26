// Member 3: Deliveries Express Router
const express = require('express');
const router = express.Router();
const deliveryController = require('./deliveryController');

router.get('/', deliveryController.getAllDeliveries);
router.get('/:id', deliveryController.getDeliveryById);
router.get('/:id/availability', deliveryController.checkAvailability);
router.post('/', deliveryController.createDelivery);
router.put('/:id/status', deliveryController.updateStatus);
router.post('/:id/status', deliveryController.updateStatus);
router.put('/:id/validate', deliveryController.validateDelivery);
router.post('/:id/validate', deliveryController.validateDelivery);
router.put('/:id/cancel', deliveryController.cancelDelivery);
router.post('/:id/cancel', deliveryController.cancelDelivery);

module.exports = router;
