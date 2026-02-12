import PgBoss from 'pg-boss';

async function debugPgBossDatabase() {
  console.log('🔍 Debugging pg-boss database operations...');

  try {
    const connectionString = process.env.DATABASE_URL;

    const boss = new PgBoss({
      connectionString,
      schema: 'pgboss',
      // Add more verbose logging
      ...(process.env.NODE_ENV === 'development' && {}),
    });

    // Capture all events
    boss.on('error', error => {
      console.error('[PgBoss] Error event:', error);
    });

    boss.on('failed' as any, data => {
      console.error('[PgBoss] Failed event:', data);
    });

    boss.on('wip', data => {
      console.log('[PgBoss] WIP event:', data);
    });

    console.log('Starting pg-boss with detailed monitoring...');
    await boss.start();
    console.log('✅ Pg-boss started');

    // Check database connection by querying pg-boss tables directly
    console.log('\nChecking database access...');

    // Try to manually insert into pg-boss tables to see what happens
    console.log('Attempting manual database operations...');

    // First, let's see what happens when we call send with await and try-catch
    console.log('\nAttempting send with detailed error catching...');

    let sendPromise;
    try {
      console.log('Creating send promise...');
      sendPromise = boss.send('test-queue', { data: 'test' });
      console.log('Send promise created, type:', typeof sendPromise);
      console.log(
        'Send promise:',
        sendPromise instanceof Promise ? 'is Promise' : 'not Promise',
      );

      const result = await sendPromise;
      console.log('Awaited result:', result);
      console.log('Result type:', typeof result);
    } catch (error) {
      console.error('❌ Send operation threw error:', error);
      console.error('Error name:', (error as any).name);
      console.error('Error message:', (error as any).message);
      console.error('Error stack:', (error as any).stack);
    }

    // Try the publishAsync method if available
    console.log('\nTrying alternative methods...');

    // Check what methods are available on the boss instance
    console.log(
      'Available methods:',
      Object.getOwnPropertyNames(Object.getPrototypeOf(boss)).filter(
        name => typeof (boss as any)[name] === 'function',
      ),
    );

    await boss.stop();
  } catch (error) {
    console.error('❌ Database debug failed:', error);
    console.error('Full error:', JSON.stringify(error as any, null, 2));
  }
}

debugPgBossDatabase().catch(console.error);
