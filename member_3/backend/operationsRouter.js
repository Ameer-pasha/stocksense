// Member 3: Operations Master Router
// Mounts Member 3's four core operational API suites
const express = require('express');
const router = express.Router();

const receiptRoutes = require('../receipts/receiptRoutes');
const deliveryRoutes = require('../deliveries/deliveryRoutes');
const transferRoutes = require('../transfers/transferRoutes');
const adjustmentRoutes = require('../adjustments/adjustmentRoutes');
const { operationsStore } = require('../store/operationsStore');

router.use('/receipts', receiptRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/transfers', transferRoutes);
router.use('/stock-adjustments', adjustmentRoutes);
router.use('/adjustments', adjustmentRoutes); // Alias for compatibility

// Health check for Member 3
router.get('/health', (req, res) => {
  res.json({
    status: 'online',
    module: 'Member 3 - Inventory Operations',
    endpoints: [
      '/api/receipts',
      '/api/deliveries',
      '/api/transfers',
      '/api/stock-adjustments'
    ],
    timestamp: new Date().toISOString()
  });
});

// Member 3 Stock Ledger export for Member 1 & Member 4
router.get('/ledger', (req, res) => {
  res.json({
    success: true,
    data: operationsStore.getLedger()
  });
});

// Products catalog endpoint for cross-member frontend integration
router.get('/products', (req, res) => {
  res.json({
    success: true,
    data: operationsStore.products
  });
});

// Warehouses list endpoint for cross-member frontend integration
router.get('/warehouses', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'WH-MAIN', name: 'Main Warehouse HQ', code: 'WH-MAIN-01', zone: 'Zone A (Bay 1-12)', manager: 'Ameer Pasha' },
      { id: 'WH-NORTH', name: 'North Logistics Hub', code: 'WH-NORTH-02', zone: 'Zone B (Bay 1-8)', manager: 'Prince' },
      { id: 'WH-SOUTH', name: 'South Depot & Storage', code: 'WH-SOUTH-03', zone: 'Zone C (Cold Storage)', manager: 'Faizan' },
      { id: 'WH-EAST', name: 'East Coast Distribution', code: 'WH-EAST-04', zone: 'Zone D (High-Bay)', manager: 'Tarun' }
    ]
  });
});

module.exports = router;
