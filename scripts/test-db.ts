import { db } from '../src/db';
import { boosterJobs } from '../src/db/schema/booster-jobs';
import { eq } from 'drizzle-orm';

async function testDatabase() {
  console.log('Testing database connection and schema...');

  try {
    // Test basic connection by querying the booster_jobs table
    const jobs = await db.select().from(boosterJobs).limit(1);
    console.log('✅ Database connection successful');
    console.log('✅ booster_jobs table accessible');

    // Test that new columns exist by inserting a test record
    const testJob = await db
      .insert(boosterJobs)
      .values({
        userId: 'test-user-1754856537373', // Use existing user
        status: 'pending',
        workerId: 'test-worker-1', // New column
        completedAt: null, // New column
      })
      .returning();

    console.log('✅ New columns (workerId, completedAt) working correctly');
    console.log('Test job created with ID:', testJob[0].id);

    // Test updating the new columns
    await db
      .update(boosterJobs)
      .set({
        workerId: 'test-worker-2',
        completedAt: new Date(),
        status: 'complete',
      })
      .where(eq(boosterJobs.id, testJob[0].id));

    console.log('✅ New columns can be updated correctly');

    // Clean up test data
    await db.delete(boosterJobs).where(eq(boosterJobs.id, testJob[0].id));
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase()
  .then(() => {
    console.log('✅ All database tests passed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Database test suite failed:', error);
    process.exit(1);
  });
