import connectDB from './src/config/db.js';
import * as testService from './src/services/testFrameworkService.js';
import dotenv from 'dotenv';
dotenv.config();

async function runEndToEndVerification() {
  await connectDB();
  console.log('=====================================================');
  console.log('  REVIVEX END-TO-END SYSTEM INTEGRATION VERIFICATION ');
  console.log('=====================================================');

  const batchRes = await testService.runAllScenariosBatch();
  console.log('Suite Run ID:', batchRes.suiteRunId);
  console.log('Total Scenarios Tested:', batchRes.totalRun);
  console.log('-----------------------------------------------------');
  console.log('Test Summary Results:');
  batchRes.results.forEach((t, i) => {
    const statusIcon = (t.status === 'SUCCESS' || t.status === 'PASSED') ? '✅ PASS' : '❌ FAIL';
    console.log(` ${i+1}. [${statusIcon}] ${t.scenarioId} (${t.executionTimeMs}ms)`);
  });
  console.log('=====================================================');
  process.exit(0);
}
runEndToEndVerification();
