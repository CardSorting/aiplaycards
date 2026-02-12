import PgBoss from 'pg-boss';

async function debugPgBossSend() {
  console.log('🔍 Debugging pg-boss send operation...');

  try {
    const connectionString = process.env.DATABASE_URL;
    console.log('Connection string exists:', !!connectionString);

    const boss = new PgBoss({
      connectionString,
      schema: 'pgboss',
    });

    // Add more detailed error handling
    boss.on('error', error => {
      console.error('[PgBoss] Error event:', error);
    });

    boss.on('wip', data => {
      console.log('[PgBoss] Work in progress event:', data);
    });

    console.log('Starting pg-boss...');
    await boss.start();
    console.log('✅ Pg-boss started successfully');

    // Try to send with explicit error handling
    console.log('\nAttempting to send job...');
    try {
      const result = await boss.send('debug-queue', { test: 'data' });
      console.log('Send result:', result);
      console.log('Send result type:', typeof result);

      if (result === null) {
        console.log('❌ Send returned null - this indicates an error or issue');
      }
    } catch (sendError) {
      console.error('❌ Send threw an error:', sendError);
    }

    // Check if the queue exists now
    console.log('\nChecking queue after send...');
    try {
      const queueSize = await boss.getQueueSize('debug-queue');
      console.log('Queue size:', queueSize);
    } catch (queueError) {
      console.error('❌ Queue size check failed:', queueError);
    }

    // Try with different options
    console.log('\nTrying with send options...');
    try {
      const result2 = await boss.send(
        'debug-queue-2',
        { test: 'data2' },
        {
          retryLimit: 0,
          expireInMinutes: 1,
        },
      );
      console.log('Send with options result:', result2);
    } catch (optionsError) {
      console.error('❌ Send with options failed:', optionsError);
    }

    // Check pg-boss version
    console.log('\nChecking pg-boss version...');
    const pgBossPackage = require('pg-boss/package.json');
    console.log('pg-boss version:', pgBossPackage.version);

    await boss.stop();
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Stack trace:', (error as any).stack);
  }
}

debugPgBossSend().catch(console.error);
