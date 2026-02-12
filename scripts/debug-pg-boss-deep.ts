import PgBoss from 'pg-boss';

async function debugPgBossDeep() {
  console.log('🔍 Deep debugging pg-boss behavior...');

  try {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL required');
    }

    console.log('\n1. Creating fresh PgBoss instance...');
    const boss = new PgBoss({
      connectionString,
      schema: 'pgboss',
      retryLimit: 3,
      retryDelay: 60,
      monitorStateIntervalSeconds: 60,
    });

    boss.on('error', error => {
      console.error('[PgBoss] Error event:', error);
    });

    console.log('2. Starting pg-boss...');
    await boss.start();
    console.log('✅ Pg-boss started');

    // Test 1: Send a very simple job
    console.log('\n3. Sending simple job...');
    const jobId1 = await boss.send('test-queue', { simple: 'test' });
    console.log('Simple job ID:', jobId1);

    const queueSize1 = await boss.getQueueSize('test-queue');
    console.log('test-queue size:', queueSize1);

    // Test 2: Send our booster job format
    console.log('\n4. Sending booster job...');
    const jobId2 = await boss.send(
      'booster-jobs',
      {
        id: 12345,
        userId: 'test-user',
        baseUrl: 'http://localhost:3000',
        priority: 1,
        metadata: { test: true },
      },
      {
        priority: 1,
        retryLimit: 3,
        retryDelay: 60,
      },
    );
    console.log('Booster job ID:', jobId2);

    const queueSize2 = await boss.getQueueSize('booster-jobs');
    console.log('booster-jobs size:', queueSize2);

    // Test 3: Setup worker for test-queue
    console.log('\n5. Setting up test worker...');
    let jobsProcessed = 0;

    const workId = await boss.work('test-queue', async job => {
      console.log('🎯 Processing test job:', (job as any).data);
      jobsProcessed++;
      return Promise.resolve();
    });
    console.log('Test worker ID:', workId);

    // Test 4: Setup worker for booster-jobs
    console.log('\n6. Setting up booster worker...');
    const boosterWorkId = await boss.work('booster-jobs', async job => {
      console.log('🎯 Processing booster job:', (job as any).data);
      jobsProcessed++;
      return Promise.resolve();
    });
    console.log('Booster worker ID:', boosterWorkId);

    // Wait and monitor
    console.log('\n7. Monitoring for 10 seconds...');
    for (let i = 0; i < 10; i++) {
      const testSize = await boss.getQueueSize('test-queue');
      const boosterSize = await boss.getQueueSize('booster-jobs');
      console.log(
        `${
          i + 1
        }s: test-queue=${testSize}, booster-jobs=${boosterSize}, processed=${jobsProcessed}`,
      );

      if (testSize === 0 && boosterSize === 0 && jobsProcessed > 0) {
        console.log('✅ Jobs processed successfully!');
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Test 5: Send another job after workers are running
    console.log('\n8. Sending job with workers running...');
    const jobId3 = await boss.send('booster-jobs', {
      id: 67890,
      userId: 'test-user-2',
      baseUrl: 'http://localhost:3000',
      metadata: { liveTest: true },
    });
    console.log('Live job ID:', jobId3);

    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Final jobs processed:', jobsProcessed);

    console.log('\n9. Cleanup...');
    await boss.stop();
    console.log('✅ Pg-boss stopped');
  } catch (error) {
    console.error('❌ Deep debug failed:', error);
    console.error((error as any).stack);
  }
}

debugPgBossDeep().catch(console.error);
