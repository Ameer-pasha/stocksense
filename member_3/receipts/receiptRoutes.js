// Member 3: Receipts Express Router
const express = require('express');
const router = express.Router();
const receiptController = require('./receiptController');

router.get('/', receiptController.getAllReceipts);
router.get('/:id', receiptController.getReceiptById);
router.post('/', receiptController.createReceipt);
router.put('/:id/validate', receiptController.validateReceipt);
router.post('/:id/validate', receiptController.validateReceipt);
router.put('/:id/cancel', receiptController.cancelReceipt);
router.post('/:id/cancel', receiptController.cancelReceipt);

module.exports = router;
