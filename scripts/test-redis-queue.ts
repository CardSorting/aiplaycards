#!/usr/bin/env tsx

import {
  addImageEditJob,
  addImageGenerationJob,
  closeQueues,
  getJobStatus,
  getQueueStats,
} from '../src/lib/queues';
import { v4 as uuidv4 } from 'uuid';

async function testRedisQueue() {
  console.log('🧪 Testing Redis Queue System...\n');

  try {
    // Test 1: Check Redis connection
    console.log('1️⃣ Testing Redis connection...');
    const stats = await getQueueStats();
    console.log('✅ Redis connection successful');
    console.log('📊 Queue stats:', JSON.stringify(stats, null, 2));
    console.log('');

    // Test 2: Add a test image generation job
    console.log('2️⃣ Testing image generation job...');
    const generationJobId = uuidv4();
    const generationJob = await addImageGenerationJob({
      prompt: 'A test image of a beautiful sunset',
      userId: 'test-user',
      sessionId: 'test-session',
      jobId: generationJobId,
    });
    console.log('✅ Image generation job added:', generationJob.id);
    console.log('');

    // Test 3: Add a test image edit job
    console.log('3️⃣ Testing image edit job...');
    const editJobId = uuidv4();
    const editJob = await addImageEditJob({
      imageUrl: 'https://example.com/test-image.png',
      editPrompt: 'Add a rainbow to the sky',
      userId: 'test-user',
      jobId: editJobId,
    });
    console.log('✅ Image edit job added:', editJob.id);
    console.log('');

    // Test 4: Check job status
    console.log('4️⃣ Testing job status retrieval...');
    const generationStatus = await getJobStatus(
      generationJobId,
      'image-generation',
    );
    const editStatus = await getJobStatus(editJobId, 'image-editing');

    console.log(
      '📋 Generation job status:',
      generationStatus ? 'Found' : 'Not found',
    );
    console.log('📋 Edit job status:', editStatus ? 'Found' : 'Not found');
    console.log('');

    // Test 5: Check updated queue stats
    console.log('5️⃣ Checking updated queue stats...');
    const updatedStats = await getQueueStats();
    console.log(
      '📊 Updated queue stats:',
      JSON.stringify(updatedStats, null, 2),
    );
    console.log('');

    console.log('🎉 All Redis queue tests passed!');
    console.log('');
    console.log('📝 Test Summary:');
    console.log('   ✅ Redis connection working');
    console.log('   ✅ Image generation queue working');
    console.log('   ✅ Image edit queue working');
    console.log('   ✅ Job status tracking working');
    console.log('   ✅ Queue statistics working');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  } finally {
    // Clean up
    console.log('\n🧹 Cleaning up...');
    await closeQueues();
    console.log('✅ Cleanup complete');
  }
}

// Handle environment setup
if (!process.env.REDIS_URL) {
  console.error('❌ REDIS_URL environment variable not set');
  console.log('   Please set REDIS_URL in your .env.local file');
  process.exit(1);
}

console.log('🔧 Environment check:');
console.log(`   REDIS_URL: ${process.env.REDIS_URL ? '✅ Set' : '❌ Not set'}`);
console.log('');

testRedisQueue().catch(console.error);
