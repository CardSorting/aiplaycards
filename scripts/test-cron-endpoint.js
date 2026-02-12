#!/usr/bin/env node

/**
 * Test script for Vercel Cron endpoint
 * Tests the /api/cron/process-jobs endpoint locally
 */

async function testCronEndpoint() {
  console.log('🧪 Testing Cron Endpoint\n');

  const baseUrl = 'http://localhost:3000';
  const cronEndpoint = `${baseUrl}/api/cron/process-jobs`;

  try {
    console.log('1. Testing unauthorized access (should fail)...');
    const unauthorizedResponse = await fetch(cronEndpoint, {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });

    if (unauthorizedResponse.status === 401) {
      console.log('   ✅ Unauthorized access properly blocked\n');
    } else {
      console.log('   ❌ Unauthorized access not blocked properly\n');
    }

    console.log('2. Testing development mode access (should work)...');
    const devResponse = await fetch(cronEndpoint);

    if (devResponse.ok) {
      const devResult = await devResponse.json();
      console.log('   ✅ Development mode access works');
      console.log(`   📊 Result: ${devResult.message}`);
      console.log(`   ⏱️  Duration: ${devResult.duration}ms`);
      console.log(
        `   📝 Pending jobs: ${
          devResult.pendingJobsFound || devResult.pendingJobs || 0
        }`,
      );
      console.log(
        `   🔄 Processed: ${
          devResult.summary?.totalProcessed || devResult.processed || 0
        }`,
      );
      console.log(`   ❌ Errors: ${devResult.summary?.totalErrors || 0}\n`);
    } else {
      console.log('   ❌ Development mode access failed');
      console.log(`   Status: ${devResponse.status}`);
      const errorResult = await devResponse.json();
      console.log(`   Error: ${errorResult.message}\n`);
    }

    console.log('3. Testing API endpoints individually...');

    // Test health check
    console.log('   📊 Testing queue health check...');
    const healthResponse = await fetch(`${baseUrl}/api/workers/trigger`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(
        `   ✅ Health check: ${healthData.totalPendingJobs || 0} pending jobs`,
      );
    } else {
      console.log(`   ❌ Health check failed: ${healthResponse.status}`);
    }

    // Test manual trigger
    console.log('   🔄 Testing manual job trigger...');
    const triggerResponse = await fetch(`${baseUrl}/api/workers/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queues: 'all', maxJobsPerQueue: 1 }),
    });

    if (triggerResponse.ok) {
      const triggerData = await triggerResponse.json();
      console.log(
        `   ✅ Manual trigger: ${
          triggerData.summary?.totalProcessed || 0
        } jobs processed`,
      );
    } else {
      console.log(`   ❌ Manual trigger failed: ${triggerResponse.status}`);
    }

    console.log('\n🎉 Cron endpoint testing completed!');
    console.log('\n📋 Next steps for Vercel deployment:');
    console.log('   1. Set CRON_SECRET environment variable in Vercel');
    console.log('   2. Deploy with: vercel --prod');
    console.log('   3. Monitor cron executions in Vercel dashboard');
    console.log('   4. Check function logs for processing status');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   - Make sure Next.js dev server is running: npm run dev');
    console.log('   - Check that API routes are accessible');
    console.log('   - Verify RabbitMQ connection (AMQP_URL)');
  }
}

if (require.main === module) {
  testCronEndpoint();
}

module.exports = { testCronEndpoint };
