const runServerDeliveryTests = require('./serverDelivery.test');
const runOperationsBridgeTests = require('./operationsBridge.test');
const runCatalogSyncTests = require('./catalogSync.test');
const runAuthTests = require('./auth.test');
const runGoldenFlowE2ETest = require('./e2eGoldenFlow.test');

async function runAll() {
  console.log('================================================================');
  console.log(' STOCKSENSE FULL ENTERPRISE INTEGRATION TEST SUITE');
  console.log(' Members 1, 2, 3, 4 Domain Logic + Unified Frontend & Server');
  console.log('================================================================\n');

  const startTime = Date.now();

  try {
    await runServerDeliveryTests();
    await runOperationsBridgeTests();
    await runCatalogSyncTests();
    await runAuthTests();
    await runGoldenFlowE2ETest();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('================================================================');
    console.log(` ALL 5 INTEGRATION SUITES PASSED CLEANLY IN ${elapsed}s!`);
    console.log(' 100% Production Readiness Verified.');
    console.log('================================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n INTEGRATION SUITE FAILED:', err);
    process.exit(1);
  }
}

runAll();
