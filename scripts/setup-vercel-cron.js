#!/usr/bin/env node

/**
 * Setup script for Vercel Cron configuration
 * Generates secure CRON_SECRET and provides setup instructions
 */

const crypto = require('crypto');

function generateCronSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function main() {
  console.log('🚀 Vercel Cron Setup for Booster Queue\n');

  const cronSecret = generateCronSecret();

  console.log('📋 Steps to configure Vercel Cron:\n');

  console.log('1. Add environment variable via Vercel CLI:');
  console.log('   vercel env add CRON_SECRET');
  console.log('   When prompted, paste: ' + cronSecret);
  console.log('   Select: Production, Preview, Development\n');

  console.log('   OR via Vercel Dashboard:');
  console.log('   - Go to Project Settings → Environment Variables');
  console.log('   - Add: CRON_SECRET = ' + cronSecret);
  console.log('   - Apply to: Production, Preview, Development\n');

  console.log('2. Verify vercel.json configuration:');
  console.log('   ✅ Cron job: /api/cron/process-jobs (every 2 minutes)');
  console.log('   ✅ Max duration: 30 seconds');
  console.log('   ✅ Functions configured\n');

  console.log('3. Deploy to Vercel:');
  console.log('   vercel --prod\n');

  console.log('4. Test the cron endpoint:');
  console.log('   curl -H "Authorization: Bearer ' + cronSecret + '" \\');
  console.log('        https://your-app.vercel.app/api/cron/process-jobs\n');

  console.log('5. Monitor cron executions:');
  console.log('   - Check Vercel Function logs');
  console.log('   - View cron execution history in Vercel Dashboard');
  console.log('   - Monitor RabbitMQ queue status\n');

  console.log('🔄 Cron Schedule (Hobby Plan):');
  console.log('   - Frequency: Daily at noon');
  console.log('   - Pattern: 0 12 * * *');
  console.log('   - Purpose: Cleanup stuck jobs');
  console.log('   - Primary processing: Auto-trigger after job submission\n');

  console.log('⚡ Auto-Trigger System:');
  console.log('   - Immediate processing after job submission');
  console.log('   - Endpoint: /api/workers/auto-trigger');
  console.log('   - Batch size: 2 jobs per queue');
  console.log('   - Timeout: 10 seconds\n');

  console.log('🛡️  Security Features:');
  console.log('   - Secure CRON_SECRET authentication');
  console.log('   - Development mode bypass for local testing');
  console.log('   - Request validation and logging');
  console.log('   - Error handling with proper status codes\n');

  console.log('📊 Monitoring URLs:');
  console.log(
    '   - Queue status: https://your-app.vercel.app/api/workers/trigger',
  );
  console.log(
    '   - Manual trigger: https://your-app.vercel.app/api/workers/trigger (POST)',
  );
  console.log(
    '   - Health check: https://your-app.vercel.app/api/workers/process-jobs',
  );
  console.log(
    '   - Cron endpoint: https://your-app.vercel.app/api/cron/process-jobs\n',
  );

  console.log('✅ Your serverless booster queue is ready for Hobby plan!');
  console.log('   Jobs process immediately after submission via auto-trigger.');
  console.log('   Daily cron handles cleanup of any stuck jobs.\n');

  console.log('🚀 Optional: For More Frequent Processing:');
  console.log('   - Uptime Robot: Free monitoring every 5 minutes');
  console.log('   - GitHub Actions: Free workflow every 5 minutes');
  console.log('   - See HOBBY_PLAN_ALTERNATIVES.md for setup\n');

  console.log('💡 Pro Tips:');
  console.log(
    '   - Test locally: npm run dev (auth is bypassed in development)',
  );
  console.log('   - Monitor logs: vercel logs your-app.vercel.app');
  console.log(
    '   - Adjust frequency: Edit vercel.json cron schedule if needed',
  );
  console.log(
    '   - Emergency stop: Remove cron from vercel.json and redeploy\n',
  );
}

if (require.main === module) {
  main();
}

module.exports = { generateCronSecret };
