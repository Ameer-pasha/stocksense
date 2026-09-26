const assert = require('assert');
const http = require('http');
const app = require('../../backend/src/app');

async function runCatalogSyncTests() {
  console.log('--- Phase 4 Test: Catalog & Location Stock Synchronization ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  try {
    // 1. Create a New Product SKU
    const newSku = `SKU-SYNC-${Date.now().toString().slice(-4)}`;
    const newProductPayload = {
      name: 'Precision Heavy Hex Bolt',
      sku: newSku,
      category: 'Hardware & Fasteners',
      warehouse: 'WH-MAIN',
      bin: 'A-04-12',
      stock: 45,
      minStock: 20,
      price: 12.50,
      cost: 6.00,
      description: 'Grade 8 high tensile zinc hex fastener'
    };

    const createProdRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProductPayload)
    });
    assert.strictEqual(createProdRes.status, 201, 'POST /api/products should return 201');
    const createdProd = (await createProdRes.json()).data;
    assert.strictEqual(createdProd.sku, newSku);
    assert.strictEqual(createdProd.status, 'IN_STOCK');
    console.log(`✓ Product created successfully: ${createdProd.name} (${createdProd.sku})`);

    // 2. Query products with search filter
    const searchRes = await fetch(`${baseUrl}/products?search=${newSku}`);
    assert.strictEqual(searchRes.status, 200);
    const searchJson = await searchRes.json();
    assert.strictEqual(searchJson.count, 1, 'Search query must find newly created SKU');
    console.log(`✓ SKU Search filter verified: found 1 matching record`);

    // 3. Update Product to Low Stock and Verify Alert Generation
    const updateRes = await fetch(`${baseUrl}/products/${createdProd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: 15 }) // Below minStock: 20
    });
    assert.strictEqual(updateRes.status, 200);
    const updatedProd = (await updateRes.json()).data;
    assert.strictEqual(updatedProd.status, 'LOW_STOCK');
    console.log(`✓ Status auto-transitioned to LOW_STOCK (Stock: ${updatedProd.stock} <= Min: ${updatedProd.minStock})`);

    // Check alerts endpoint
    const alertsRes = await fetch(`${baseUrl}/alerts`);
    assert.strictEqual(alertsRes.status, 200);
    const alertsJson = await alertsRes.json();
    const alertFound = alertsJson.data.find(a => a.product && a.product.sku === newSku);
    assert(alertFound, 'Alerts endpoint must include the low-stock alert for the SKU');
    assert.strictEqual(alertFound.type, 'warning');
    console.log(`✓ Live Alert generated: "${alertFound.title}"`);

    // 4. Update Product to Zero Stock (Out of Stock Alert)
    await fetch(`${baseUrl}/products/${createdProd.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: 0 })
    });
    const zeroAlertsRes = await fetch(`${baseUrl}/alerts`);
    const zeroAlertsJson = await zeroAlertsRes.json();
    const outAlert = zeroAlertsJson.data.find(a => a.product && a.product.sku === newSku);
    assert(outAlert, 'Must generate out-of-stock alert');
    assert.strictEqual(outAlert.type, 'danger');
    console.log(`✓ Critical Out-of-Stock Alert generated: "${outAlert.title}"`);

    // 5. Category Management Sync
    const newCatName = `Test Industrial ${Date.now().toString().slice(-4)}`;
    const catCreateRes = await fetch(`${baseUrl}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCatName })
    });
    assert.strictEqual(catCreateRes.status, 201);
    const createdCat = (await catCreateRes.json()).data;

    const catListRes = await fetch(`${baseUrl}/categories`);
    const catListJson = await catListRes.json();
    assert(catListJson.data.some(c => c.name === newCatName), 'Categories list must include new category');
    console.log(`✓ Category management verified: "${newCatName}" created and listed`);

    // Delete category
    const catDelRes = await fetch(`${baseUrl}/categories/${createdCat.id}`, {
      method: 'DELETE'
    });
    assert.strictEqual(catDelRes.status, 200);
    console.log(`✓ Category deleted successfully`);

    // 6. Warehouses Query Sync
    const whRes = await fetch(`${baseUrl}/warehouses`);
    assert.strictEqual(whRes.status, 200);
    const whJson = await whRes.json();
    assert(whJson.data.length >= 4, 'Must return at least 4 warehouses');
    console.log(`✓ Warehouses verified: ${whJson.data.length} warehouses active`);

    console.log(' All Phase 4 Catalog & Location Stock Synchronization assertions passed successfully!\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

if (require.main === module) {
  runCatalogSyncTests().catch((err) => {
    console.error('Phase 4 Test Failed:', err);
    process.exit(1);
  });
}

module.exports = runCatalogSyncTests;
