// Member 3: Transfers Express Router
const express = require('express');
const router = express.Router();
const transferController = require('./transferController');

router.get('/', transferController.getAllTransfers);
router.get('/:id', transferController.getTransferById);
router.post('/', transferController.createTransfer);
router.put('/:id/confirm', transferController.confirmDispatch);
router.post('/:id/confirm', transferController.confirmDispatch);
router.put('/:id/dispatch', transferController.confirmDispatch);
router.post('/:id/dispatch', transferController.confirmDispatch);
router.put('/:id/complete', transferController.completeArrival);
router.post('/:id/complete', transferController.completeArrival);
router.put('/:id/cancel', transferController.cancelTransfer);
router.post('/:id/cancel', transferController.cancelTransfer);

module.exports = router;
