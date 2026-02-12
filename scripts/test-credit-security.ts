import { db } from '../src/db';
import { creditTransactions, users } from '../src/db/schema';
import { CreditService } from '../src/services/credit-service';
import { eq } from 'drizzle-orm';

/**
 * Comprehensive test suite for enhanced credit system security
 * Tests atomic transactions, race conditions, and bypass prevention
 */

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Test helper functions
function log(message: string) {
  console.log(`[CreditSecurityTest] ${message}`);
}

function pass(test: string, message: string, details?: any) {
  results.push({ test, passed: true, message, details });
  log(`✅ ${test}: ${message}`);
}

function fail(test: string, message: string, details?: any) {
  results.push({ test, passed: false, message, details });
  log(`❌ ${test}: ${message}`);
}

// Create test user
async function createTestUser(userId: string): Promise<void> {
  try {
    await db
      .insert(users)
      .values({
        userId,
        email: `test-${userId}@example.com`,
        username: `test-${userId}`,
        credits: 100,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: users.userId,
        set: {
          credits: 100,
          isActive: true,
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error('Failed to create test user:', error);
  }
}

// Clean up test user
async function cleanupTestUser(userId: string): Promise<void> {
  try {
    await db
      .delete(creditTransactions)
      .where(eq(creditTransactions.userId, userId));
    await db.delete(users).where(eq(users.userId, userId));
  } catch (error) {
    console.error('Failed to cleanup test user:', error);
  }
}

// Test 1: Basic credit deduction atomicity
async function testAtomicDeduction() {
  const testUserId = 'test-atomic-deduction';
  await createTestUser(testUserId);

  try {
    const result = await CreditService.deductCredits({
      userId: testUserId,
      amount: 50,
      reason: 'booster_open',
    });

    if (result.success && result.newBalance === 50) {
      pass(
        'Atomic Deduction',
        'Credits deducted correctly with proper balance update',
      );
    } else {
      fail(
        'Atomic Deduction',
        'Credit deduction failed or incorrect balance',
        result,
      );
    }

    // Verify transaction was logged
    const txs = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, testUserId));

    if (
      txs.length === 1 &&
      txs[0].delta === -50 &&
      txs[0].reason === 'booster_open'
    ) {
      pass('Transaction Logging', 'Credit transaction properly logged');
    } else {
      fail(
        'Transaction Logging',
        'Credit transaction not logged correctly',
        txs,
      );
    }
  } catch (error) {
    fail('Atomic Deduction', 'Exception during credit deduction', error);
  }

  await cleanupTestUser(testUserId);
}

// Test 2: Insufficient credits prevention
async function testInsufficientCredits() {
  const testUserId = 'test-insufficient-credits';
  await createTestUser(testUserId);

  try {
    const result = await CreditService.deductCredits({
      userId: testUserId,
      amount: 150, // More than available (100)
      reason: 'booster_open',
    });

    if (!result.success && result.error === 'Insufficient credits') {
      pass('Insufficient Credits', 'Correctly prevented overdraft');
    } else {
      fail('Insufficient Credits', 'Failed to prevent overdraft', result);
    }

    // Verify balance unchanged
    const balance = await CreditService.getBalance(testUserId);
    if (balance && balance.balance === 100) {
      pass(
        'Balance Preservation',
        'User balance preserved after failed deduction',
      );
    } else {
      fail(
        'Balance Preservation',
        'User balance modified after failed deduction',
        balance,
      );
    }
  } catch (error) {
    fail(
      'Insufficient Credits',
      'Exception during insufficient credit test',
      error,
    );
  }

  await cleanupTestUser(testUserId);
}

// Test 3: Race condition simulation
async function testRaceConditions() {
  const testUserId = 'test-race-condition';
  await createTestUser(testUserId);

  try {
    // Simulate concurrent credit deductions
    const promises = Array.from({ length: 5 }, () =>
      CreditService.deductCredits({
        userId: testUserId,
        amount: 30, // Total would be 150, but user only has 100
        reason: 'booster_open',
      }),
    );

    const results = await Promise.all(promises);
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    // Should only allow 3 successful deductions (3 * 30 = 90 <= 100)
    if (successCount <= 3 && failureCount >= 2) {
      pass(
        'Race Condition Prevention',
        `Correctly handled concurrent requests: ${successCount} success, ${failureCount} failures`,
      );
    } else {
      fail(
        'Race Condition Prevention',
        `Unexpected race condition behavior: ${successCount} success, ${failureCount} failures`,
        results,
      );
    }

    // Verify final balance
    const finalBalance = await CreditService.getBalance(testUserId);
    if (
      finalBalance &&
      finalBalance.balance >= 0 &&
      finalBalance.balance <= 100
    ) {
      pass(
        'Balance Consistency',
        `Final balance valid: ${finalBalance.balance}`,
      );
    } else {
      fail(
        'Balance Consistency',
        'Invalid final balance after race condition',
        finalBalance,
      );
    }
  } catch (error) {
    fail(
      'Race Condition Prevention',
      'Exception during race condition test',
      error,
    );
  }

  await cleanupTestUser(testUserId);
}

// Test 4: Invalid input validation
async function testInputValidation() {
  const testUserId = 'test-input-validation';
  await createTestUser(testUserId);

  try {
    // Test negative amount
    const result1 = await CreditService.deductCredits({
      userId: testUserId,
      amount: -10,
      reason: 'booster_open',
    });

    if (!result1.success && result1.error === 'Amount must be positive') {
      pass('Negative Amount Validation', 'Correctly rejected negative amount');
    } else {
      fail(
        'Negative Amount Validation',
        'Failed to reject negative amount',
        result1,
      );
    }

    // Test empty reason
    const result2 = await CreditService.deductCredits({
      userId: testUserId,
      amount: 10,
      reason: '',
    });

    if (!result2.success && result2.error === 'Reason is required') {
      pass('Empty Reason Validation', 'Correctly rejected empty reason');
    } else {
      fail('Empty Reason Validation', 'Failed to reject empty reason', result2);
    }

    // Test empty user ID
    const result3 = await CreditService.deductCredits({
      userId: '',
      amount: 10,
      reason: 'booster_open',
    });

    if (!result3.success && result3.error === 'User ID is required') {
      pass('Empty User ID Validation', 'Correctly rejected empty user ID');
    } else {
      fail(
        'Empty User ID Validation',
        'Failed to reject empty user ID',
        result3,
      );
    }
  } catch (error) {
    fail('Input Validation', 'Exception during input validation test', error);
  }

  await cleanupTestUser(testUserId);
}

// Test 5: Inactive account handling
async function testInactiveAccount() {
  const testUserId = 'test-inactive-account';
  await createTestUser(testUserId);

  try {
    // Deactivate account
    await db
      .update(users)
      .set({ isActive: false })
      .where(eq(users.userId, testUserId));

    const result = await CreditService.deductCredits({
      userId: testUserId,
      amount: 10,
      reason: 'booster_open',
    });

    if (!result.success && result.error === 'Account is inactive') {
      pass(
        'Inactive Account Handling',
        'Correctly prevented credit operations on inactive account',
      );
    } else {
      fail(
        'Inactive Account Handling',
        'Failed to prevent operations on inactive account',
        result,
      );
    }
  } catch (error) {
    fail(
      'Inactive Account Handling',
      'Exception during inactive account test',
      error,
    );
  }

  await cleanupTestUser(testUserId);
}

// Test 6: Credit addition security
async function testCreditAddition() {
  const testUserId = 'test-credit-addition';
  await createTestUser(testUserId);

  try {
    const result = await CreditService.addCredits({
      userId: testUserId,
      amount: 50,
      reason: 'paypal_purchase',
    });

    if (result.success && result.newBalance === 150) {
      pass(
        'Credit Addition',
        'Credits added correctly with proper balance update',
      );
    } else {
      fail(
        'Credit Addition',
        'Credit addition failed or incorrect balance',
        result,
      );
    }

    // Test large credit addition (potential abuse)
    const largeResult = await CreditService.addCredits({
      userId: testUserId,
      amount: 999999,
      reason: 'paypal_purchase',
    });

    if (largeResult.success) {
      // This should work but we might want to add limits in the future
      pass(
        'Large Credit Addition',
        'Large credit addition processed (consider adding limits)',
      );
    } else {
      fail(
        'Large Credit Addition',
        'Large credit addition failed unexpectedly',
        largeResult,
      );
    }
  } catch (error) {
    fail('Credit Addition', 'Exception during credit addition test', error);
  }

  await cleanupTestUser(testUserId);
}

// Test 7: Refund functionality
async function testRefundSystem() {
  const testUserId = 'test-refund-system';
  await createTestUser(testUserId);

  try {
    // First, deduct some credits
    const deductResult = await CreditService.deductCredits({
      userId: testUserId,
      amount: 30,
      reason: 'booster_open',
    });

    if (!deductResult.success || !deductResult.transactionId) {
      fail('Refund System Setup', 'Failed to setup refund test', deductResult);
      return;
    }

    // Now refund the transaction
    const refundResult = await CreditService.refundTransaction(
      testUserId,
      deductResult.transactionId,
      'processing_failed',
    );

    if (refundResult.success && refundResult.newBalance === 100) {
      pass('Refund System', 'Credit refund processed correctly');
    } else {
      fail(
        'Refund System',
        'Credit refund failed or incorrect balance',
        refundResult,
      );
    }

    // Verify refund transaction was logged
    const txs = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, testUserId));

    const refundTx = txs.find(tx => tx.reason === 'refund_processing_failed');
    if (refundTx && refundTx.delta === 30) {
      pass('Refund Transaction Logging', 'Refund transaction properly logged');
    } else {
      fail(
        'Refund Transaction Logging',
        'Refund transaction not logged correctly',
        txs,
      );
    }
  } catch (error) {
    fail('Refund System', 'Exception during refund test', error);
  }

  await cleanupTestUser(testUserId);
}

// Main test runner
async function runAllTests() {
  log('Starting comprehensive credit security tests...');

  try {
    await testAtomicDeduction();
    await testInsufficientCredits();
    await testRaceConditions();
    await testInputValidation();
    await testInactiveAccount();
    await testCreditAddition();
    await testRefundSystem();
  } catch (error) {
    log(`Fatal error during tests: ${error}`);
  }

  // Report results
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;

  log('\n=== TEST RESULTS ===');
  log(`Total tests: ${totalTests}`);
  log(`Passed: ${passedTests}`);
  log(`Failed: ${totalTests - passedTests}`);
  log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  // Show failed tests
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    log('FAILED TESTS:');
    failedTests.forEach(test => {
      log(`❌ ${test.test}: ${test.message}`);
      if (test.details) {
        log(`   Details: ${JSON.stringify(test.details, null, 2)}`);
      }
    });
  }

  return passedTests === totalTests;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { runAllTests };
