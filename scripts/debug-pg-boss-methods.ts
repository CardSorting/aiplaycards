import PgBoss from 'pg-boss';

async function debugPgBossMethods() {
  console.log('🔍 Debugging pg-boss method availability...');

  try {
    const connectionString = process.env.DATABASE_URL;

    console.log('1. Creating new PgBoss instance...');
    const boss = new PgBoss({ connectionString, schema: 'pgboss' });

    console.log('2. Methods before start:');
    console.log(
      Object.getOwnPropertyNames(boss).filter(
        name => typeof (boss as any)[name] === 'function',
      ),
    );
    console.log('Prototype methods:');
    console.log(
      Object.getOwnPropertyNames(Object.getPrototypeOf(boss)).filter(
        name => typeof (boss as any)[name] === 'function',
      ),
    );

    // Check if send method exists
    console.log('Has send method:', 'send' in boss);
    console.log('Send method type:', typeof boss.send);

    console.log('\n3. Starting boss...');
    await boss.start();
    console.log('✅ Started');

    console.log('4. Methods after start:');
    console.log(
      Object.getOwnPropertyNames(boss).filter(
        name => typeof (boss as any)[name] === 'function',
      ),
    );
    console.log('Prototype methods:');
    console.log(
      Object.getOwnPropertyNames(Object.getPrototypeOf(boss)).filter(
        name => typeof (boss as any)[name] === 'function',
      ),
    );

    console.log('Has send method after start:', 'send' in boss);
    console.log('Send method type after start:', typeof boss.send);

    // Try to access the send method directly
    if (boss.send) {
      console.log('\n5. Testing send method...');
      try {
        console.log('Calling boss.send...');
        const result = await boss.send('test', { data: 'test' });
        console.log('Send result:', result);
      } catch (error) {
        console.error('Send error:', error);
      }
    } else {
      console.error('❌ No send method found');
    }

    // Check the constructor and verify we have the right class
    console.log('\n6. Instance verification:');
    console.log('Constructor name:', boss.constructor.name);
    console.log('Instance of PgBoss:', boss instanceof PgBoss);

    await boss.stop();
  } catch (error) {
    console.error('❌ Method debug failed:', error);
  }
}

debugPgBossMethods().catch(console.error);
