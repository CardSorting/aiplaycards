import PgBoss from 'pg-boss';

async function fixPgBossPartitions() {
  console.log('🔧 Fixing pg-boss partition issues...');

  try {
    const connectionString = process.env.DATABASE_URL;

    const boss = new PgBoss({
      connectionString,
      schema: 'pgboss',
    });

    boss.on('error', error => {
      console.error('[PgBoss] Error:', error);
    });

    console.log('Starting pg-boss...');
    await boss.start();

    // Try to explicitly create the queue first
    console.log('\n1. Creating booster-jobs queue explicitly...');
    try {
      await boss.createQueue('booster-jobs');
      console.log('✅ Queue created successfully');
    } catch (error) {
      console.error('❌ Queue creation failed:', error);
    }

    // Check if queue exists now
    console.log('\n2. Checking queue existence...');
    const queues = await boss.getQueues();
    console.log('Available queues:', queues);

    // Try sending a job now
    console.log('\n3. Sending job after queue creation...');
    const jobId = await boss.send('booster-jobs', {
      id: 12345,
      userId: 'test-user',
      baseUrl: 'http://localhost:3000',
      metadata: { test: true },
    });
    console.log('Job ID after queue creation:', jobId);

    if (jobId) {
      console.log('✅ Job sent successfully!');
      const queueSize = await boss.getQueueSize('booster-jobs');
      console.log('Queue size:', queueSize);
    }

    // Try creating a worker
    console.log('\n4. Creating worker...');
    let processedJobs = 0;
    const workId = await boss.work('booster-jobs', async job => {
      console.log('🎯 Processing job:', (job as any).data);
      processedJobs++;
      return Promise.resolve();
    });
    console.log('Worker ID:', workId);

    // Send another job
    console.log('\n5. Sending job with active worker...');
    const jobId2 = await boss.send('booster-jobs', {
      id: 67890,
      userId: 'worker-test',
      baseUrl: 'http://localhost:3000',
      metadata: { workerTest: true },
    });
    console.log('Second job ID:', jobId2);

    // Wait and monitor
    console.log('\n6. Monitoring for 10 seconds...');
    for (let i = 0; i < 10; i++) {
      const size = await boss.getQueueSize('booster-jobs');
      console.log(`${i + 1}s: Queue size=${size}, Processed=${processedJobs}`);

      if (size === 0 && processedJobs > 0) {
        console.log('✅ Jobs processed successfully!');
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    await boss.stop();
    console.log('✅ Test completed');
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

fixPgBossPartitions().catch(console.error);
