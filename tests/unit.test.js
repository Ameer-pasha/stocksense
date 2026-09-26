const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const User = require('../models/User');
const Stock = require('../models/Stock');
const StockLedger = require('../models/StockLedger');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const { adjustStock } = require('../services/stockService');
const { dateFilter, objectId, integer } = require('../utils/validation');
const app = require('../app');

const id = () => new mongoose.Types.ObjectId();

test('model and request validation work without a database', async () => {
  const user = new User({ name: 'Test', email: 'TEST@EXAMPLE.COM', password: 'password123' });
  await user.validate();
  assert.equal(user.email, 'test@example.com');
  const otp = user.generateOTP();
  assert.match(otp, /^\d{6}$/);
  assert.equal(user.verifyOTP(otp), true);
  assert.equal(user.verifyOTP('00000'), false);
  user.otp_expiry = new Date(Date.now() - 1);
  assert.equal(user.verifyOTP(otp), false);
  await assert.rejects(new User({ name: 'X', email: 'invalid', password: 'short' }).validate());
  await assert.rejects(new Stock({ product_id: id(), warehouse_id: id(), quantity: 0.5 }).validate());
  assert.throws(() => objectId('invalid'), /valid ObjectId/);
  assert.throws(() => integer(1.5, 'quantity'), /integer/);
  assert.equal(dateFilter({ end_date: '2026-09-26' }).createdAt.$lt.toISOString(), '2026-09-27T00:00:00.000Z');
  await request(app).get('/api/stock-ledger').expect(401);
  await request(app).post('/api/auth/signup').send({ name: 'X', email: 'x@example.com',
    password: 'password123', role: 'admin' }).expect(403);
  await request(app).get('/api/does-not-exist').expect(404);
});

test('adjustStock requires a transaction and enforces signs', async () => {
  const params = { product_id: id(), warehouse_id: id(), quantity_change: 3,
    transaction_type: 'receipt', reference_id: id(), reference_number: 'REC-0001' };
  await assert.rejects(adjustStock(params), /active MongoDB transaction/);
  await assert.rejects(adjustStock({ ...params, quantity_change: -3,
    session: { inTransaction: () => true } }), /wrong sign/);
  await assert.rejects(adjustStock({ ...params, quantity_change: 0,
    session: { inTransaction: () => true } }), /cannot be zero/);
});

test('adjustStock writes matching before/after quantities and refuses insufficient stock', async () => {
  const originalUpdate = Stock.findOneAndUpdate;
  const originalFind = Stock.findOne;
  const originalCreate = StockLedger.create;
  const originalProduct = Product.findOne;
  const originalWarehouse = Warehouse.findOne;
  const calls = [];
  try {
    Product.findOne = () => ({ session: async () => ({ name: 'Product' }) });
    Warehouse.findOne = () => ({ session: async () => ({ name: 'Warehouse' }) });
    Stock.findOneAndUpdate = async (filter, update, options) => {
      calls.push({ filter, update, options });
      return { quantity: 5 };
    };
    StockLedger.create = async (docs, options) => {
      calls.push({ docs, options });
      return [{ ...docs[0] }];
    };
    const session = { inTransaction: () => true };
    const params = { product_id: id(), warehouse_id: id(), quantity_change: 3,
      transaction_type: 'receipt', reference_id: id(), reference_number: 'REC-0001', session };
    const result = await adjustStock(params);
    assert.equal(result.stock.quantity, 5);
    assert.equal(result.ledgerEntry.stock_before, 2);
    assert.equal(result.ledgerEntry.stock_after, 5);
    assert.equal(calls[0].update.$inc.quantity, 3);
    assert.equal(calls[1].options.session, session);

    Stock.findOneAndUpdate = async () => null;
    Stock.findOne = () => ({ session() { return this; }, lean: async () => ({ quantity: 2 }) });
    await assert.rejects(adjustStock({ ...params, quantity_change: -4,
      transaction_type: 'delivery' }), /Insufficient stock. Available: 2/);
    assert.equal(calls.filter(call => call.docs).length, 1); // no ledger on failure
  } finally {
    Stock.findOneAndUpdate = originalUpdate;
    Stock.findOne = originalFind;
    StockLedger.create = originalCreate;
    Product.findOne = originalProduct;
    Warehouse.findOne = originalWarehouse;
  }
});
