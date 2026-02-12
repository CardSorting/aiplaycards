/* eslint-disable no-console */
import 'dotenv/config';
import {
  addNanoCompositeJob,
  closeNanoQueues,
  getNanoCompositeJobStatus,
  getNanoCompositeQueueStats,
} from '../src/lib/queues-nano';

// Test script for nano composite queue functionality
async function testNanoCompositeQueue() {
  try {
    console.log('🧪 Testing Nano Composite Queue System...\n');

    // Test queue stats (should be empty initially)
    console.log('📊 Initial queue stats:');
    const initialStats = await getNanoCompositeQueueStats();
    console.log(JSON.stringify(initialStats, null, 2));
    console.log('');

    // Test adding a job (without actually running the worker)
    console.log('➕ Adding test job...');
    const testData = {
      jobId: 'test-job-123',
      userId: 'test-user-456',
      secondImageData:
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      templateImageUrl:
        'https://f005.backblazeb2.com/file/printeregg/Screenshot+2025-11-17+at+10.01.39%E2%80%AFPM.png',
    };

    const job = await addNanoCompositeJob(testData);
    console.log(`✅ Job added successfully with ID: ${job.id}`);
    console.log('');

    // Test getting job status
    console.log('🔍 Testing job status retrieval...');
    const retrievedJob = await getNanoCompositeJobStatus(job.id!);
    if (retrievedJob) {
      console.log('✅ Job retrieved successfully');
      console.log(`📋 Job state: ${await retrievedJob.getState()}`);
      console.log(`👤 User ID: ${retrievedJob.data.userId}`);
    } else {
      console.log('❌ Job not found');
    }
    console.log('');

    // Test updated queue stats
    console.log('📊 Updated queue stats:');
    const updatedStats = await getNanoCompositeQueueStats();
    console.log(JSON.stringify(updatedStats, null, 2));
    console.log('');

    console.log('🎉 Nano Composite Queue Test Completed Successfully!');
  } catch (error) {
    console.error('❌ Nano Composite Queue Test Failed:', error);
  } finally {
    // Clean up queues
    try {
      await closeNanoQueues();
      console.log('🧹 Queues closed successfully');
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
}

// Run the test
testNanoCompositeQueue();
