// Member 3: Stock Adjustments Express Router
const express = require('express');
const router = express.Router();
const adjustmentController = require('./adjustmentController');

router.get('/', adjustmentController.getAllAdjustments);
router.get('/:id', adjustmentController.getAdjustmentById);
router.post('/', adjustmentController.createAdjustment);

module.exports = router;
