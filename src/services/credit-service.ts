import { db } from '../db';
import { users } from '../db/schema/users';
import { creditTransactions } from '../db/schema/credit-transactions';
import { eq, sql } from 'drizzle-orm';

export interface CreditOperation {
  userId: string;
  amount: number;
  reason: string;
  jobId?: number;
  metadata?: Record<string, unknown>;
}

export interface CreditOperationResult {
  success: boolean;
  newBalance: number;
  transactionId?: number;
  error?: string;
}

/**
 * Enhanced credit service with atomic transactions and bypass prevention
 */
export class CreditService {
  /**
   * Atomically deduct credits from user account with strict validation
   * Prevents race conditions and ensures transaction integrity
   */
  static async deductCredits(
    operation: CreditOperation,
  ): Promise<CreditOperationResult> {
    if (operation.amount <= 0) {
      return {
        success: false,
        newBalance: 0,
        error: 'Amount must be positive',
      };
    }

    if (!operation.userId?.trim()) {
      return {
        success: false,
        newBalance: 0,
        error: 'User ID is required',
      };
    }

    if (!operation.reason?.trim()) {
      return {
        success: false,
        newBalance: 0,
        error: 'Reason is required',
      };
    }

    try {
      // Atomic operation: check balance, deduct credits, log transaction
      const result = await db.execute(sql`
        WITH credit_deduction AS (
          UPDATE users
          SET
            credits = credits - ${operation.amount},
            updated_at = CURRENT_TIMESTAMP
          WHERE
            user_id = ${operation.userId}
            AND credits >= ${operation.amount}
            AND status = 'active'
          RETURNING user_id, credits as new_balance
        ),
        transaction_log AS (
          INSERT INTO credit_transactions (user_id, delta, reason, job_id, created_at)
          SELECT 
            ${operation.userId}, 
            ${-operation.amount}, 
            ${operation.reason},
            ${operation.jobId || null},
            CURRENT_TIMESTAMP
          WHERE EXISTS (SELECT 1 FROM credit_deduction)
          RETURNING id as transaction_id
        )
        SELECT 
          cd.new_balance,
          tl.transaction_id
        FROM credit_deduction cd
        CROSS JOIN transaction_log tl;
      `);

      const row = result?.rows?.[0];
      if (!row) {
        // Check why the operation failed
        const userCheck = await db
          .select({ credits: users.credits, status: users.status })
          .from(users)
          .where(eq(users.userId, operation.userId))
          .limit(1);

        const user = userCheck[0];
        if (!user) {
          return {
            success: false,
            newBalance: 0,
            error: 'User not found',
          };
        }

        if (user.status !== 'active') {
          return {
            success: false,
            newBalance: user.credits,
            error: 'Account is inactive',
          };
        }

        if (user.credits < operation.amount) {
          return {
            success: false,
            newBalance: user.credits,
            error: 'Insufficient credits',
          };
        }

        return {
          success: false,
          newBalance: user.credits,
          error: 'Credit deduction failed',
        };
      }

      return {
        success: true,
        newBalance: Number(row.new_balance),
        transactionId: Number(row.transaction_id),
      };
    } catch (error) {
      console.error('[CreditService.deductCredits] Error:', error);
      return {
        success: false,
        newBalance: 0,
        error: 'Database operation failed',
      };
    }
  }

  /**
   * Atomically add credits to user account
   * Used for refunds, bonuses, and credit purchases
   */
  static async addCredits(
    operation: CreditOperation,
  ): Promise<CreditOperationResult> {
    if (operation.amount <= 0) {
      return {
        success: false,
        newBalance: 0,
        error: 'Amount must be positive',
      };
    }

    if (!operation.userId?.trim()) {
      return {
        success: false,
        newBalance: 0,
        error: 'User ID is required',
      };
    }

    if (!operation.reason?.trim()) {
      return {
        success: false,
        newBalance: 0,
        error: 'Reason is required',
      };
    }

    try {
      // Atomic operation: add credits and log transaction
      const result = await db.execute(sql`
        WITH credit_addition AS (
          UPDATE users
          SET
            credits = credits + ${operation.amount},
            updated_at = CURRENT_TIMESTAMP
          WHERE
            user_id = ${operation.userId}
            AND status = 'active'
          RETURNING user_id, credits as new_balance
        ),
        transaction_log AS (
          INSERT INTO credit_transactions (user_id, delta, reason, job_id, created_at)
          SELECT 
            ${operation.userId}, 
            ${operation.amount}, 
            ${operation.reason},
            ${operation.jobId || null},
            CURRENT_TIMESTAMP
          WHERE EXISTS (SELECT 1 FROM credit_addition)
          RETURNING id as transaction_id
        )
        SELECT 
          ca.new_balance,
          tl.transaction_id
        FROM credit_addition ca
        CROSS JOIN transaction_log tl;
      `);

      const row = result?.rows?.[0];
      if (!row) {
        // Check why the operation failed
        const userCheck = await db
          .select({ credits: users.credits, status: users.status })
          .from(users)
          .where(eq(users.userId, operation.userId))
          .limit(1);

        const user = userCheck[0];
        if (!user) {
          return {
            success: false,
            newBalance: 0,
            error: 'User not found',
          };
        }

        if (user.status !== 'active') {
          return {
            success: false,
            newBalance: user.credits,
            error: 'Account is inactive',
          };
        }

        return {
          success: false,
          newBalance: user.credits,
          error: 'Credit addition failed',
        };
      }

      return {
        success: true,
        newBalance: Number(row.new_balance),
        transactionId: Number(row.transaction_id),
      };
    } catch (error) {
      console.error('[CreditService.addCredits] Error:', error);
      return {
        success: false,
        newBalance: 0,
        error: 'Database operation failed',
      };
    }
  }

  /**
   * Get user's current credit balance with validation
   */
  static async getBalance(
    userId: string,
  ): Promise<{ balance: number; isActive: boolean } | null> {
    if (!userId?.trim()) {
      return null;
    }

    try {
      const result = await db
        .select({
          credits: users.credits,
          status: users.status,
        })
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1);

      const user = result[0];
      if (!user) {
        return null;
      }

      return {
        balance: user.credits,
        isActive: user.status === 'active',
      };
    } catch (error) {
      console.error('[CreditService.getBalance] Error:', error);
      return null;
    }
  }

  /**
   * Validate if user has sufficient credits for an operation
   * Should be used before attempting credit deduction
   */
  static async hasEnoughCredits(
    userId: string,
    amount: number,
  ): Promise<boolean> {
    if (!userId?.trim() || amount <= 0) {
      return false;
    }

    try {
      const balance = await this.getBalance(userId);
      return balance !== null && balance.isActive && balance.balance >= amount;
    } catch (error) {
      console.error('[CreditService.hasEnoughCredits] Error:', error);
      return false;
    }
  }

  /**
   * Refund credits for a specific transaction
   * Used when operations fail or need to be reversed
   */
  static async refundTransaction(
    userId: string,
    originalTransactionId: number,
    reason: string,
  ): Promise<CreditOperationResult> {
    if (!userId?.trim() || !reason?.trim()) {
      return {
        success: false,
        newBalance: 0,
        error: 'Invalid parameters',
      };
    }

    try {
      // Find the original transaction to get the refund amount
      const originalTx = await db
        .select({ delta: creditTransactions.delta })
        .from(creditTransactions)
        .where(eq(creditTransactions.id, originalTransactionId))
        .limit(1);

      if (!originalTx[0]) {
        return {
          success: false,
          newBalance: 0,
          error: 'Original transaction not found',
        };
      }

      const refundAmount = Math.abs(originalTx[0].delta);

      return await this.addCredits({
        userId,
        amount: refundAmount,
        reason: `refund_${reason}`,
        metadata: { originalTransactionId },
      });
    } catch (error) {
      console.error('[CreditService.refundTransaction] Error:', error);
      return {
        success: false,
        newBalance: 0,
        error: 'Refund operation failed',
      };
    }
  }
}

// Legacy compatibility - gradually migrate to CreditService class methods
export const creditService = {
  deductCredits: CreditService.deductCredits.bind(CreditService),
  addCredits: CreditService.addCredits.bind(CreditService),
  getBalance: CreditService.getBalance.bind(CreditService),
  hasEnoughCredits: CreditService.hasEnoughCredits.bind(CreditService),
  refundTransaction: CreditService.refundTransaction.bind(CreditService),
};
