# Enhanced Credit System Security

This document describes the security improvements implemented to prevent credit bypasses and ensure atomic transactions in the Pokemon Card Maker application.

## Overview

The enhanced credit system implements multiple layers of protection against common vulnerabilities:

1. **Atomic Database Transactions** - All credit operations are atomic to prevent race conditions
2. **Input Validation** - Comprehensive validation of all credit-related inputs
3. **Authorization Checks** - User authentication and authorization validation
4. **Audit Logging** - Complete transaction history with detailed logging
5. **Error Handling** - Graceful error handling with automatic refunds when needed

## Key Security Features

### 1. Atomic Credit Operations

The new `CreditService` class ensures all credit operations are atomic:

```typescript
// All operations use atomic SQL transactions
WITH credit_deduction AS (
  UPDATE users
  SET credits = credits - ${amount}
  WHERE user_id = ${userId} AND credits >= ${amount} AND is_active = true
  RETURNING user_id, credits as new_balance
),
transaction_log AS (
  INSERT INTO credit_transactions (user_id, delta, reason, created_at)
  SELECT ${userId}, ${-amount}, ${reason}, CURRENT_TIMESTAMP
  WHERE EXISTS (SELECT 1 FROM credit_deduction)
  RETURNING id as transaction_id
)
SELECT new_balance, transaction_id FROM credit_deduction, transaction_log;
```

### 2. Race Condition Prevention

- **Database-level locks**: Uses `WHERE credits >= amount` conditions to prevent overdrafts
- **Atomic operations**: Credit checks and deductions happen in single transactions
- **Validation before operations**: Pre-flight checks reduce failed transactions

### 3. Input Validation & Security

**Credit Amount Validation:**

- Must be positive numbers
- Maximum limits to prevent abuse
- Zero and negative amounts rejected

**User Authorization:**

- Authentication required for all operations
- User can only modify their own credits
- Account status validation (active/inactive)

**Reason Code Validation:**

- Only whitelisted transaction reasons allowed
- Prevents arbitrary reason injection

### 4. Enhanced Logging & Audit Trail

Every credit operation is logged with:

- User ID and timestamp
- Amount and direction (positive/negative)
- Reason code for the transaction
- Associated job/order IDs when applicable
- Success/failure status

## API Enhancements

### Updated Endpoints

1. **Booster Opening (`/api/booster-open`)**

   - Pre-validates credit availability
   - Atomic job creation + credit deduction
   - Automatic refunds on processing failures

2. **PayPal Credit Purchase (`/api/paypal/capture-credit-order`)**

   - Uses atomic credit addition service
   - Proper error handling and rollback
   - Enhanced transaction logging

3. **Credits API (`/api/credits`)**
   - Enhanced security headers
   - Account status reporting
   - Improved error handling

### New Security Middleware

**Credit Validation Middleware:**

- Request authentication and authorization
- User agent filtering (blocks bots/scrapers)
- Rate limiting considerations
- Input sanitization and validation

## Security Measures Implemented

### 1. Bypass Prevention

**SQL Injection Protection:**

- Parameterized queries exclusively
- No string concatenation in SQL
- Drizzle ORM type safety

**Race Condition Protection:**

- Database-level constraints
- Atomic transaction blocks
- Proper isolation levels

**Privilege Escalation Prevention:**

- User ID validation in all requests
- Cannot modify other users' credits
- Authentication required for all operations

### 2. Input Validation

**Comprehensive Validation:**

```typescript
// Amount validation
if (amount <= 0) return error('Amount must be positive');

// User ID validation
if (!userId?.trim()) return error('User ID is required');

// Reason validation
const validReasons = ['booster_open', 'paypal_purchase', ...];
if (!validReasons.includes(reason)) return error('Invalid reason');
```

**Suspicious Activity Detection:**

- Large transaction amounts flagged
- Unusual user agent patterns blocked
- Failed transaction attempts logged

### 3. Error Handling & Recovery

**Automatic Refunds:**

- Processing failures trigger automatic refunds
- Failed transactions are properly logged
- User balance restored to previous state

**Graceful Degradation:**

- Fallback mechanisms for database issues
- Detailed error logging for debugging
- User-friendly error messages

## Testing & Verification

### Security Test Suite

The comprehensive test suite (`scripts/test-credit-security.ts`) validates:

1. **Atomic Operations** - Credit deductions are truly atomic
2. **Insufficient Credits** - Overdraft prevention works correctly
3. **Race Conditions** - Concurrent requests handled safely
4. **Input Validation** - All invalid inputs properly rejected
5. **Inactive Accounts** - Suspended accounts cannot perform operations
6. **Refund System** - Failed transactions properly refunded

### Running Tests

```bash
# Set up test database connection
export DATABASE_URL="your_test_database_url"

# Run security tests
npx tsx scripts/test-credit-security.ts
```

## Migration Guide

### For Existing Code

1. **Replace direct database calls:**

   ```typescript
   // Old (vulnerable)
   await db.update(users).set({ credits: credits - amount });

   // New (secure)
   const result = await CreditService.deductCredits({
     userId,
     amount,
     reason: 'booster_open',
   });
   ```

2. **Add validation middleware:**

   ```typescript
   // Add to credit-related endpoints
   import { withCreditValidation } from '../../../src/middleware/credit-validation';

   export const POST = withCreditValidation(
     { userId, operation: 'deduct', requiredCredits: amount },
     handler,
   );
   ```

3. **Update error handling:**
   ```typescript
   // Add automatic refunds for failed operations
   if (processingFailed) {
     await CreditService.addCredits({
       userId,
       amount,
       reason: 'processing_failed',
     });
   }
   ```

## Security Best Practices

### For Developers

1. **Always use CreditService** - Never directly modify user credits
2. **Validate all inputs** - Use the validation middleware
3. **Log all operations** - Ensure audit trail completeness
4. **Handle failures gracefully** - Implement proper refund mechanisms
5. **Test thoroughly** - Run security tests before deployment

### For Operations

1. **Monitor transaction logs** - Watch for suspicious patterns
2. **Set up alerts** - Monitor for failed transactions
3. **Regular audits** - Verify credit balance integrity
4. **Database backups** - Ensure transaction history preservation

## Performance Considerations

### Optimizations Implemented

1. **Database Indexes** - Proper indexing on user_id and transaction fields
2. **Connection Pooling** - Efficient database connection management
3. **Caching** - Appropriate cache headers for credit balance requests
4. **Batch Operations** - Where possible, batch related operations

### Monitoring

- Transaction success/failure rates
- Average transaction processing time
- Database connection pool utilization
- Error frequency and patterns

## Compliance & Audit

### Audit Trail

- Complete transaction history preserved
- User actions logged with timestamps
- Failed attempts recorded for security analysis
- Payment gateway integration audit logs

### Data Integrity

- Regular balance reconciliation checks
- Transaction sum validation
- Database constraint enforcement
- Automated integrity monitoring

## Future Enhancements

### Planned Improvements

1. **Advanced Rate Limiting** - Per-user transaction limits
2. **Fraud Detection** - ML-based suspicious activity detection
3. **Real-time Monitoring** - Enhanced observability dashboard
4. **Automated Testing** - CI/CD integration for security tests

### Considerations

- GDPR compliance for audit logs
- PCI DSS requirements for payment data
- SOX compliance for financial transactions
- Enhanced monitoring and alerting
