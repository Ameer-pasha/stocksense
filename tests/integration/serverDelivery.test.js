const assert = require('assert');
const http = require('http');
const path = require('path');
const app = require('../../backend/src/app');

async function runServerDeliveryTests() {
  console.log('--- Phase 1 Test: Server Delivery & Static Asset Hosting ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Static HTML Delivery (index.html)
    const indexRes = await fetch(`${baseUrl}/`);
    assert.strictEqual(indexRes.status, 200, 'GET / should return 200 OK');
    const indexHtml = await indexRes.text();
    assert(indexHtml.includes('StockSense'), 'Index HTML must include StockSense brand');
    assert(indexHtml.includes('id="view-dashboard"'), 'Index HTML must include dashboard view');
    console.log('✓ GET / successfully serves desktop HTML frontend');

    // 2. Static Stylesheet Delivery (styles.css)
    const cssRes = await fetch(`${baseUrl}/styles.css`);
    assert.strictEqual(cssRes.status, 200, 'GET /styles.css should return 200 OK');
    const cssText = await cssRes.text();
    assert(cssText.includes('--primary'), 'Stylesheet must contain CSS custom properties');
    console.log('✓ GET /styles.css successfully serves CSS design tokens');

    // 3. Static Logic Engine Delivery (app.js)
    const jsRes = await fetch(`${baseUrl}/app.js`);
    assert.strictEqual(jsRes.status, 200, 'GET /app.js should return 200 OK');
    const jsText = await jsRes.text();
    assert(jsText.includes('class AppState'), 'app.js must contain AppState definition');
    console.log('✓ GET /app.js successfully serves frontend application logic');

    // 4. API Health Check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200, 'GET /api/health should return 200 OK');
    const healthJson = await healthRes.json();
    assert.strictEqual(healthJson.status, 'ok', 'Health status should be ok');
    console.log('✓ GET /api/health responds with active status');

    // 5. Dashboard KPIs endpoint
    const dashRes = await fetch(`${baseUrl}/api/dashboard`);
    assert.strictEqual(dashRes.status, 200, 'GET /api/dashboard should return 200 OK');
    const dashJson = await dashRes.json();
    assert(dashJson.kpis, 'Dashboard response must include kpis object');
    assert(typeof dashJson.kpis.totalStock === 'number', 'totalStock must be a number');
    console.log('✓ GET /api/dashboard provides valid operational metrics');

    console.log(' All Phase 1 Server Delivery assertions passed successfully!\n');
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

if (require.main === module) {
  runServerDeliveryTests().catch((err) => {
    console.error('Phase 1 Test Failed:', err);
    process.exit(1);
  });
}

module.exports = runServerDeliveryTests;
