import 'dotenv/config';
import { db } from '../src/db';
import { users } from '../src/db/schema/users';
import { eq, sql } from 'drizzle-orm';

async function main() {
  const userId = process.env.SEED_USER_ID;
  const amount = Number(process.env.SEED_CREDITS || 10);
  if (!userId) throw new Error('Provide SEED_USER_ID');

  const updated = await db
    .update(users)
    .set({
      credits: sql`${users.credits} + ${amount}`,
      updatedAt: new Date(),
    } as any)
    .where(eq(users.userId, userId))
    .returning();
  console.log(`User ${userId} credits: ${updated[0]?.credits}`);
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
