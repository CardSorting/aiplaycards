# Spam Prevention System

This directory contains the modular spam prevention system broken down into separate, maintainable components.

## Structure

### Types (`../types/spam-prevention.ts`)

- **SpamPreventionConfig**: Configuration interface for all spam prevention settings
- **UserBehaviorProfile**: User behavior tracking and reputation scoring
- **ContentQualityMetrics**: Content quality scoring metrics
- **AnomalyScore**: Anomaly detection scoring
- **ProfanityCheckResult**: Profanity detection results
- **ContentValidationResult**: Content validation results
- **RateLimitResult**: Rate limiting results
- **UserBehaviorAnalysisResult**: User behavior analysis results
- **SpamPreventionOptions**: Middleware configuration options
- **SpamPreventionError**: Custom error class for spam prevention

### Configuration (`../config/spam-prevention.ts`)

- **defaultSpamConfig**: Default configuration with sensible defaults for all settings

### Storage (`./storage.ts`)

- **getUserProfile()**: Get or create user behavior profile
- **updateUserProfile()**: Update user profile with new activity
- **calculateUserReputation()**: Calculate user reputation score
- **getRateLimitStore()**: Access rate limiting store
- **getUserBehaviorStore()**: Access user behavior store
- **resetUserBehavior()**: Reset user behavior tracking

### Rate Limiting (`./rate-limiting.ts`)

- **checkRateLimit()**: Check rate limits with adaptive thresholds
- **getUserRateLimitStatus()**: Get current rate limit status with reputation info

### Content Validation (`./content-validation.ts`)

- **validateContent()**: Validate content with quality scoring and profanity detection
- **detectProfanity()**: Detect profanity using leo-profanity
- **calculateContentQuality()**: Calculate content quality score using multiple metrics

### User Behavior (`./user-behavior.ts`)

- **analyzeUserBehavior()**: Analyze user behavior for suspicious activity
- **detectAnomalies()**: Detect anomalies in user behavior and content
- **getUserBehaviorAnalytics()**: Get comprehensive user behavior analytics

### Utilities (`./utilities.ts`)

- **isUserSuspicious()**: Check if a user is marked as suspicious
- **markUserSuspicious()**: Mark a user as suspicious

### Main Middleware (`../middleware/spam-prevention-new.ts`)

- **withSpamPrevention()**: Main middleware wrapper function
- Re-exports of all utility functions for external use

## Usage

### Basic Usage

```typescript
import { withSpamPrevention } from '../middleware/spam-prevention-new';

export const POST = withSpamPrevention(async (request, user) => {
  // Your API logic here
  return NextResponse.json({ success: true });
});
```

### With Custom Configuration

```typescript
import { withSpamPrevention } from '../middleware/spam-prevention-new';
import { defaultSpamConfig } from '../config/spam-prevention';

const customConfig = {
  ...defaultSpamConfig,
  maxRequestsPerMinute: 20,
  enableProfanityFilter: false,
};

export const POST = withSpamPrevention(
  async (request, user) => {
    // Your API logic here
    return NextResponse.json({ success: true });
  },
  customConfig,
  { contentField: 'cardInfo' },
);
```

### Using Utility Functions

```typescript
import {
  isUserSuspicious,
  markUserSuspicious,
  getUserRateLimitStatus,
} from '../middleware/spam-prevention-new';

// Check if user is suspicious
if (isUserSuspicious(userId)) {
  // Handle suspicious user
}

// Mark user as suspicious
markUserSuspicious(userId, 'multiple_failed_attempts');

// Get rate limit status
const status = getUserRateLimitStatus(userId);
```

## Features

- **Adaptive Rate Limiting**: Rate limits adjust based on user reputation
- **Content Quality Scoring**: Intelligent content validation with multiple metrics
- **Profanity Detection**: Configurable profanity filtering using leo-profanity
- **User Reputation System**: Track user behavior and adjust thresholds accordingly
- **Anomaly Detection**: Detect unusual patterns in user behavior
- **Suspicious Pattern Detection**: Identify spam and suspicious content patterns
- **Flexible Configuration**: Customizable settings for different use cases

## Migration from Old System

The old `spam-prevention.ts` file has been broken down into these modular components. To migrate:

1. Update imports to use the new middleware: `spam-prevention-new.ts`
2. All functionality remains the same, but is now more maintainable
3. Utility functions are now properly exported and can be imported individually
4. Configuration is centralized in a separate file

## Future Enhancements

- **Redis Integration**: Replace in-memory stores with Redis for production use
- **Machine Learning**: Enhanced anomaly detection using ML models
- **Webhook Support**: Notify external systems of suspicious activity
- **Analytics Dashboard**: Web interface for monitoring and configuration
- **A/B Testing**: Test different spam prevention strategies
