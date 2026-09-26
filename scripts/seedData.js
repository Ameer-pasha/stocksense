require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const Stock = require('../models/Stock');
const { adjustStock } = require('../services/stockService');

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in .env');
  await mongoose.connect(process.env.MONGODB_URI);
  const warehouses = [
    { name: 'Main Warehouse', location: 'Mumbai, Maharashtra' },
    { name: 'Secondary Warehouse', location: 'Delhi, India' }
  ];
  const docs = [];
  for (const data of warehouses) {
    let warehouse = await Warehouse.findOne({ name: data.name }).collation({ locale: 'en', strength: 2 });
    if (!warehouse) warehouse = await Warehouse.create(data);
    docs.push(warehouse);
  }
  const samples = [
    { name: 'Steel Rods', sku: 'STL-001', category: 'Raw Materials', unit_of_measure: 'units',
      reorder_level: 25, unit_price: 100, warehouse: docs[0], initial: 100 },
    { name: 'Copper Wire', sku: 'CPR-001', category: 'Raw Materials', unit_of_measure: 'meters',
      reorder_level: 30, unit_price: 25, warehouse: docs[0], initial: 15 },
    { name: 'Safety Gloves', sku: 'GLV-001', category: 'Safety', unit_of_measure: 'pairs',
      reorder_level: 10, unit_price: 5, warehouse: docs[1], initial: 0 }
  ];
  for (const { warehouse, initial, ...data } of samples) {
    let product = await Product.findOne({ sku: data.sku });
    if (!product) product = await Product.create(data);
    if (await Stock.exists({ product_id: product._id, warehouse_id: warehouse._id })) continue;
    if (initial) {
      await mongoose.connection.transaction(session => adjustStock({
        product_id: product._id, warehouse_id: warehouse._id,
        quantity_change: initial, transaction_type: 'adjustment',
        reference_id: product._id, reference_number: `INIT-${product.sku}`,
        notes: 'Seeded opening stock', session
      }));
    } else {
      await Stock.create({ product_id: product._id, warehouse_id: warehouse._id, quantity: 0 });
    }
  }
  console.log('Seed ready: 2 warehouses, 3 products, opening stock (safe to rerun).');
}

main().catch(error => { console.error(error); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
