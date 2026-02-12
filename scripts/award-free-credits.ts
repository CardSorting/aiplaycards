/* eslint-disable no-console */
import 'dotenv/config';
import { db } from '../src/db';
import { users } from '../src/db/schema';
import { CreditService } from '../src/services/credit-service';
import { eq } from 'drizzle-orm';

async function main() {
  // Get active users who haven't gotten recent free credits
  const usersToAward = await db
    .select({
      userId: users.userId,
      username: users.username,
      credits: users.credits,
    })
    .from(users)
    .where(eq(users.status, 'active'))
    .limit(50); // Award to 50 users at a time

  console.log(`Awarding free credits to ${usersToAward.length} users...`);

  for (const user of usersToAward) {
    // Award random amount between 10-50 credits
    const amount = Math.floor(Math.random() * 40) + 10;

    const result = await CreditService.addCredits({
      userId: user.userId,
      amount,
      reason: 'free_giveaway',
      metadata: {
        giveaway_type: 'daily_random',
        original_balance: user.credits,
      },
    });

    if (result.success) {
      console.log(
        `✓ Awarded ${amount} credits to ${
          user.username || user.userId
        } (new balance: ${result.newBalance})`,
      );
    } else {
      console.error(
        `✗ Failed to award credits to ${user.username || user.userId}: ${
          result.error
        }`,
      );
    }
  }

  console.log('Free credit giveaway completed!');
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error('Free credit giveaway failed:', e);
    process.exit(1);
  });
