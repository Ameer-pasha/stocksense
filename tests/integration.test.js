const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

process.env.JWT_SECRET = 'a-test-secret-value-longer-than-thirty-two-chars';
process.env.NODE_ENV = 'development';
process.env.DEV_RETURN_OTP = 'true';
const app = require('../app');
const User = require('../models/User');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const InternalTransfer = require('../models/InternalTransfer');
const StockAdjustment = require('../models/StockAdjustment');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Counter = require('../models/Counter');

let replset, unavailable;
before(async () => {
  try {
    if (!process.env.TEST_MONGO_URI) {
      replset = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    }
    await mongoose.connect(process.env.TEST_MONGO_URI || replset.getUri());
    await Promise.all([User, Stock, StockLedger, Product, Warehouse, InternalTransfer,
      StockAdjustment, Receipt, Delivery, Counter].map(model => model.init()));
  } catch (error) {
    unavailable = error;
  }
});
after(async () => {
  await mongoose.disconnect();
  if (replset) await replset.stop();
});

test('complete inventory flow on a transactional MongoDB replica set', async (t) => {
  if (unavailable) {
    if (process.env.REQUIRE_DB_TESTS === '1') throw unavailable;
    return t.skip(`MongoDB unavailable: ${unavailable.message}`);
  }
  const admin = await User.create({ name: 'Admin', email: 'admin@example.com',
    password: 'password123', role: 'admin' });
  assert.notEqual(admin.password, 'password123');
  const login = await request(app).post('/api/auth/login')
    .send({ email: 'ADMIN@EXAMPLE.COM', password: 'password123' }).expect(200);
  const adminToken = login.body.data.token;
  const asAdmin = (method, url) => request(app)[method](url).set('Authorization', `Bearer ${adminToken}`);

  await t.test('authentication, roles and request validation', async () => {
    await request(app).get('/api/health').expect(200);
    await request(app).get('/api/dashboard/kpis').expect(401);
    await request(app).post('/api/auth/signup').send({ name: 'Elevated', email: 'e@example.com',
      password: 'password123', role: 'admin' }).expect(403);
    const signup = await request(app).post('/api/auth/signup').send({ name: 'Staff',
      email: 'STAFF@example.com', password: 'password123' }).expect(201);
    assert.equal(signup.body.data.user.role, 'staff');
    assert.equal(signup.body.data.user.email, 'staff@example.com');
    await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${signup.body.data.token}`).expect(200);
    await request(app).post('/api/warehouses').set('Authorization', `Bearer ${signup.body.data.token}`)
      .send({ name: 'Forbidden', location: 'Here' }).expect(403);
    await request(app).post('/api/auth/login').send({ email: 'staff@example.com',
      password: 'wrongpass' }).expect(401);
    await asAdmin('get', '/api/stock-ledger?page=0').expect(400);
    await asAdmin('get', '/api/stock-ledger?limit=1000').expect(400);
    await asAdmin('get', '/api/stock-ledger?start_date=2026-02-31').expect(400);
    await asAdmin('get', '/api/alerts/low-stock?warehouse_id=invalid').expect(400);
    await asAdmin('get', '/api/not-a-route').expect(404);
  });

  let main, secondary, steel, gloves;
  await t.test('warehouses, products, opening balance and KPIs', async () => {
    main = (await asAdmin('post', '/api/warehouses').send({
      name: 'Main Warehouse', location: 'Mumbai' }).expect(201)).body.data._id;
    secondary = (await asAdmin('post', '/api/warehouses').send({
      name: 'Secondary Warehouse', location: 'Delhi' }).expect(201)).body.data._id;
    await asAdmin('post', '/api/warehouses').send({ name: 'main warehouse', location: 'Elsewhere' }).expect(409);
    steel = (await asAdmin('post', '/api/products').send({ name: 'Steel Rods', sku: 'stl-001',
      reorder_level: 120, unit_price: 10, warehouse_id: main, initial_stock: 100 }).expect(201)).body.data._id;
    gloves = (await asAdmin('post', '/api/products').send({ name: 'Safety Gloves', sku: 'glv-001',
      reorder_level: 10, warehouse_id: secondary, initial_stock: 0 }).expect(201)).body.data._id;
    const warehouses = await asAdmin('get', '/api/warehouses').expect(200);
    assert.equal(warehouses.body.data[0].total_stock_value, 1000);
    assert.equal((await asAdmin('get', `/api/warehouses/${main}/stock`).expect(200)).body.data[0].quantity, 100);
    const kpis = await asAdmin('get', '/api/dashboard/kpis').expect(200);
    assert.equal(kpis.body.data.total_products, 2);
    assert.equal(kpis.body.data.low_stock_items, 2);
    assert.equal(kpis.body.data.out_of_stock_items, 1);
    await asAdmin('delete', `/api/warehouses/${main}`).expect(409);
    await asAdmin('delete', `/api/products/${steel}`).expect(409);
    assert.equal(await StockLedger.countDocuments({ transaction_type: 'adjustment' }), 1);
  });

  await t.test('receipts and deliveries are atomic, stateful and logged', async () => {
    const receipt = (await asAdmin('post', '/api/receipts').send({ supplier_name: 'ABC Supplies',
      warehouse_id: main, items: [{ product_id: steel, quantity_received: 50 }] }).expect(201)).body.data;
    assert.equal(receipt.receipt_number, 'REC-0001');
    assert.equal((await asAdmin('get', '/api/dashboard/kpis').expect(200)).body.data.pending_receipts, 1);
    await asAdmin('put', `/api/receipts/${receipt._id}/validate`).expect(200);
    await asAdmin('put', `/api/receipts/${receipt._id}/validate`).expect(409);
    assert.equal((await Stock.findOne({ product_id: steel, warehouse_id: main })).quantity, 150);
    const delivery = (await asAdmin('post', '/api/deliveries').send({ customer_name: 'Buyer',
      warehouse_id: main, items: [{ product_id: steel, quantity: 20 }] }).expect(201)).body.data;
    assert.equal(delivery.delivery_number, 'DEL-0001');
    await asAdmin('put', `/api/deliveries/${delivery._id}/validate`).expect(200);
    assert.equal((await Stock.findOne({ product_id: steel, warehouse_id: main })).quantity, 130);
  });

  await t.test('transfer confirm, complete and cancellation reverse exactly once', async () => {
    const transfer = (await asAdmin('post', '/api/transfers').send({ from_warehouse_id: main,
      to_warehouse_id: secondary, items: [{ product_id: steel, quantity: 20 }] }).expect(201)).body.data;
    assert.equal(transfer.transfer_number, 'TRF-0001');
    await asAdmin('put', `/api/transfers/${transfer._id}/confirm`).expect(200);
    assert.equal((await Stock.findOne({ product_id: steel, warehouse_id: main })).quantity, 110);
    await asAdmin('put', `/api/transfers/${transfer._id}/confirm`).expect(409);
    await asAdmin('put', `/api/transfers/${transfer._id}/complete`).expect(200);
    assert.equal((await Stock.findOne({ product_id: steel, warehouse_id: secondary })).quantity, 20);
    await asAdmin('put', `/api/transfers/${transfer._id}/cancel`).expect(409);
    const cancel = (await asAdmin('post', '/api/transfers').send({ from_warehouse_id: main,
      to_warehouse_id: secondary, items: [{ product_id: steel, quantity: 10 }] }).expect(201)).body.data;
    await asAdmin('put', `/api/transfers/${cancel._id}/confirm`).expect(200);
    await asAdmin('put', `/api/transfers/${cancel._id}/cancel`).expect(200);
    assert.equal((await Stock.findOne({ product_id: steel, warehouse_id: main })).quantity, 110);
    await asAdmin('put', `/api/transfers/${cancel._id}/cancel`).expect(409);
    const reversals = await StockLedger.find({ reference_id: cancel._id });
    assert.deepEqual(reversals.map(x => x.quantity_change).sort((a, b) => a - b), [-10, 10]);
  });

  await t.test('failed multi-item transfer rolls back all stock and ledger writes', async () => {
    const copper = (await asAdmin('post', '/api/products').send({ name: 'Copper Wire', sku: 'cpr-001',
      warehouse_id: main, initial_stock: 1 }).expect(201)).body.data._id;
    const transfer = (await asAdmin('post', '/api/transfers').send({ from_warehouse_id: main,
      to_warehouse_id: secondary,
      items: [{ product_id: steel, quantity: 100 }, { product_id: copper, quantity: 1 }] }).expect(201)).body.data;
    const delivery = (await asAdmin('post', '/api/deliveries').send({ customer_name: 'Other buyer',
      warehouse_id: main, items: [{ product_id: copper, quantity: 1 }] }).expect(201)).body.data;
    await asAdmin('put', `/api/deliveries/${delivery._id}/validate`).expect(200);
    await asAdmin('put', `/api/transfers/${transfer._id}/confirm`).expect(409);
    assert.equal((await Stock.findOne({ product_id: steel, warehouse_id: main })).quantity, 110);
    assert.equal(await StockLedger.countDocuments({ reference_id: transfer._id }), 0);
    assert.equal((await InternalTransfer.findById(transfer._id)).status, 'draft');
  });

  await t.test('adjustments, filters, alerts, search and dashboard', async () => {
    const adjustment = await asAdmin('post', '/api/stock-adjustments').send({ product_id: steel,
      warehouse_id: main, counted_quantity: 107, reason: 'damaged', notes: '3 damaged' }).expect(201);
    assert.equal(adjustment.body.data.difference, -3);
    await asAdmin('post', '/api/stock-adjustments').send({ product_id: steel,
      warehouse_id: main, counted_quantity: 107, reason: 'miscount' }).expect(200);
    await asAdmin('post', '/api/stock-adjustments').send({ product_id: steel,
      warehouse_id: main, counted_quantity: -1, reason: 'miscount' }).expect(400);
    assert.equal(await StockAdjustment.countDocuments(), 1);
    const ledger = await asAdmin('get', `/api/stock-ledger?product_id=${steel}&page=1&limit=2`).expect(200);
    assert.equal(ledger.body.data.length, 2);
    assert.equal(ledger.body.pagination.limit, 2);
    const summary = await asAdmin('get', `/api/stock-ledger/summary?warehouse_id=${main}&product_id=${steel}`).expect(200);
    assert.equal(summary.body.data.find(row => row._id === 'delivery').total_quantity_out, 20);
    assert.equal(summary.body.data.find(row => row._id === 'adjustment').total_quantity_out, 3);
    const productLedger = await asAdmin('get', `/api/stock-ledger/product/${steel}`).expect(200);
    assert.ok(productLedger.body.data.length >= 6);
    await asAdmin('get', `/api/stock-ledger/warehouse/${main}?start_date=2020-01-01`).expect(200);
    const low = await asAdmin('get', `/api/alerts/low-stock?warehouse_id=${main}`).expect(200);
    assert.equal(low.body.data.find(item => item.sku === 'STL-001').current_stock, 107);
    const out = await asAdmin('get', `/api/alerts/out-of-stock?warehouse_id=${secondary}`).expect(200);
    assert.equal(out.body.data[0].sku, 'GLV-001');
    const search = await asAdmin('get', `/api/search/products?q=steel&warehouse_id=${main}`).expect(200);
    assert.equal(search.body.data[0].total_stock, 107);
    assert.equal((await asAdmin('get', '/api/search/products?q=%5B%5D').expect(200)).body.count, 0);
    await asAdmin('get', '/api/search/products?q=a').expect(400);
    assert.ok((await asAdmin('get', '/api/dashboard/recent-operations?limit=3').expect(200)).body.data.length === 3);
  });

  await t.test('OTP reset is single-use and cannot authenticate as an access token', async () => {
    const forgot = await request(app).post('/api/auth/forgot-password')
      .send({ email: 'admin@example.com' }).expect(200);
    const otp = forgot.body.data.otp;
    assert.match(otp, /^\d{6}$/);
    await request(app).post('/api/auth/verify-otp')
      .send({ email: 'admin@example.com', otp: '000000' }).expect(400);
    const verified = await request(app).post('/api/auth/verify-otp')
      .send({ email: 'admin@example.com', otp }).expect(200);
    const resetToken = verified.body.data.resetToken;
    await request(app).get('/api/auth/me')
      .set('Authorization', `Bearer ${resetToken}`).expect(401);
    await request(app).post('/api/auth/reset-password').send({ email: 'admin@example.com',
      newPassword: 'newpassword123', resetToken }).expect(200);
    await request(app).post('/api/auth/reset-password').send({ email: 'admin@example.com',
      newPassword: 'anotherpass123', resetToken }).expect(401);
    await asAdmin('get', '/api/auth/me').expect(401); // old access JWT revoked
    await request(app).post('/api/auth/login').send({ email: 'admin@example.com',
      password: 'password123' }).expect(401);
    await request(app).post('/api/auth/login').send({ email: 'admin@example.com',
      password: 'newpassword123' }).expect(200);
  });
});
