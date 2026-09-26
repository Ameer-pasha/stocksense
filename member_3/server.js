// Member 3: Standalone Inventory Operations Backend Server
// Can be run independently or mounted into the master backend
const express = require('express');
const cors = require('cors');
const operationsRouter = require('./backend/operationsRouter');

const app = express();
const PORT = process.env.MEMBER_3_PORT || process.env.PORT || 5003;

// Permissive CORS configuration for seamless frontend cross-origin requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging for developer debugging
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[Member 3 API] ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Root welcome & discovery endpoint
app.get('/info', (req, res) => {
  res.json({
    name: 'StockSense — Member 3 Inventory Operations Service',
    description: 'Handles Inbound Receipts, Outbound Deliveries, Internal Transfers, and Stock Adjustments',
    endpoints: {
      receipts: '/api/receipts',
      deliveries: '/api/deliveries',
      transfers: '/api/transfers',
      adjustments: '/api/stock-adjustments',
      products: '/api/products',
      warehouses: '/api/warehouses',
      ledger: '/api/ledger',
      health: '/api/health'
    }
  });
});

// Dual mounting: available at both /api/* and root /* for seamless frontend connectivity
app.use('/api', operationsRouter);
app.use('/', operationsRouter);

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` StockSense — Member 3 Operations API`);
    console.log(` Server active on http://0.0.0.0:${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}/api`);
    console.log(` Endpoints:`);
    console.log(`   - Receipts:         http://localhost:${PORT}/api/receipts`);
    console.log(`   - Deliveries:       http://localhost:${PORT}/api/deliveries`);
    console.log(`   - Transfers:        http://localhost:${PORT}/api/transfers`);
    console.log(`   - Adjustments:      http://localhost:${PORT}/api/stock-adjustments`);
    console.log(`   - Products:         http://localhost:${PORT}/api/products`);
    console.log(`   - Ledger:           http://localhost:${PORT}/api/ledger`);
    console.log(`   - Health check:     http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
