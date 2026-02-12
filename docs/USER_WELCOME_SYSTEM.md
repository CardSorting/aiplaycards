# User Welcome System

This document describes the graceful user welcome system implemented for PlayMore TCG, which automatically gives new users welcome credits when they sign up.

## Overview

The welcome system provides a seamless onboarding experience with multiple fallback mechanisms to ensure reliability:

- **24 welcome credits** for new users (configurable via `WELCOME_CREDITS` environment variable)
- **Atomic database operations** to prevent race conditions
- **Multiple fallback mechanisms** for graceful error handling
- **Rich welcome messaging** with onboarding tips
- **Comprehensive logging** and notifications

## Architecture

### Core Components

1. **Constants** (`src/constants.ts`)

   - `WELCOME_CREDITS`: Configurable via environment variable (default: 24)
   - `BOOSTER_COST_CREDITS`: Cost for opening booster packs (6)

2. **User Service** (`src/services/user-service.ts`)

   - `ensureUserExists()`: Main entry point for user creation
   - `atomicUpsertWithWelcomeCredits()`: Preferred atomic method
   - `safeUserCreation()`: Fallback method with multiple safety checks

3. **Notification Service** (`src/services/notification-service.ts`)

   - Welcome message generation
   - Onboarding tips and guidance
   - Credit formatting utilities

4. **Auth Middleware** (`src/middleware/auth-user.ts`)
   - Reusable middleware for user authentication
   - Automatic local user creation
   - Context passing for authenticated routes

## How It Works

### User Creation Flow

1. **User authenticates** via Stack Auth
2. **API routes call** `userService.ensureUserExists()`
3. **Atomic operation attempts** to create user with welcome credits
4. **If atomic fails**, fallback to safe creation method
5. **Welcome notification** is created for new users
6. **Rich welcome data** is returned to frontend

### Database Operations

The system uses PostgreSQL's `xmax = 0` detection to identify new vs. existing users:

```sql
WITH user_upsert AS (
  INSERT INTO users (user_id, email, username, credits, ...)
  VALUES (...)
  ON CONFLICT (user_id) DO UPDATE SET ...
  RETURNING *, (xmax = 0) AS was_inserted
),
welcome_credit_tx AS (
  INSERT INTO credit_transactions (user_id, delta, reason, ...)
  SELECT user_id, 24, 'welcome_bonus', ...
  FROM user_upsert
  WHERE was_inserted = true
)
SELECT * FROM user_upsert;
```

## API Integration

### Credits API (`/api/credits`)

Returns enriched response for new users:

```json
{
  "credits": 24,
  "isNewUser": true,
  "welcomeMessage": "🎉 Welcome to PlayMore TCG! You received 24 credits to get started!",
  "boosterInfo": "🎁 With your 24 credits, you can open 4 booster packs right away!",
  "onboardingTips": [
    "🃏 Open booster packs to discover new cards",
    "🎨 Create custom cards with our card editor",
    "🏪 Trade cards in the marketplace",
    "💰 Earn credits by selling your creations",
    "👥 Follow other players and see their collections"
  ],
  "creditsAwarded": 100
}
```

### Booster Open API (`/api/booster-open`)

Automatically creates users and provides enhanced logging for new users opening their first booster.

## Configuration

### Environment Variables

```bash
# Welcome credits amount (default: 24)
WELCOME_CREDITS=24
```

### Constants

Located in `src/constants.ts`:

- `WELCOME_CREDITS`: Welcome credits amount
- `BOOSTER_COST_CREDITS`: Cost per booster pack

## Error Handling

The system includes multiple layers of error handling:

1. **Atomic Operation**: Primary method using SQL transactions
2. **Safe Fallback**: Check-then-create with separate transaction recording
3. **Basic Creation**: Last resort creates user with 0 credits
4. **Graceful Degradation**: API continues functioning even if user creation fails

## Logging and Monitoring

### Console Logs

- ✅ `[userService] Welcome! New user {userId} received 24 credits`
- ✅ `[booster-open] 🎉 New user {userId} opening their first booster with 24 welcome credits!`
- ✅ `[Auth Middleware] 🎉 Welcome {userId}! Awarded 24 credits`

### Database Tracking

All welcome credits are recorded in `credit_transactions` table:

- `reason`: 'welcome_bonus'
- `delta`: Positive credit amount
- `user_id`: User identifier
- `created_at`: Timestamp

## Migration Notes

### From Old System

The old `upsertWithWelcomeCredits()` method is now deprecated in favor of the new service-based approach:

```typescript
// OLD (deprecated)
await userQueries.upsertWithWelcomeCredits(userData);

// NEW (recommended)
const result = await userService.ensureUserExists(userData);
```

### Database Schema

No database schema changes are required. The system uses existing tables:

- `users`: User records with credits
- `credit_transactions`: Transaction history

## Testing

The system can be tested by:

1. Creating new Stack Auth users
2. Checking credit balance via `/api/credits`
3. Verifying transactions in database
4. Testing error scenarios

### Manual Testing

```bash
# Check new user receives welcome credits
curl -H "Cookie: stack-session=..." /api/credits

# Verify transaction recorded
psql -c "SELECT * FROM credit_transactions WHERE reason = 'welcome_bonus';"
```

## Future Enhancements

Potential improvements:

- **Frontend welcome modal** showing onboarding tips
- **Progressive onboarding** with step-by-step guidance
- **Achievement system** for first actions
- **Referral bonuses** for invited users
- **A/B testing** for different welcome amounts

## Troubleshooting

### Common Issues

1. **User not receiving credits**

   - Check `WELCOME_CREDITS` environment variable
   - Verify user is truly new (check `credit_transactions`)
   - Check logs for error messages

2. **Database errors**

   - Ensure proper database permissions
   - Check connection stability
   - Verify schema matches expectations

3. **Stack Auth integration**
   - Confirm Stack Auth configuration
   - Check user data extraction logic
   - Verify authentication middleware

### Debug Commands

```bash
# Check recent welcome transactions
psql -c "SELECT * FROM credit_transactions WHERE reason = 'welcome_bonus' ORDER BY created_at DESC LIMIT 10;"

# Check user creation pattern
psql -c "SELECT DATE(created_at), COUNT(*) FROM users GROUP BY DATE(created_at) ORDER BY DATE(created_at) DESC;"
```
