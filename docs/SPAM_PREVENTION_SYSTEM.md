# Intelligent Spam Prevention System for Card Creators

## Overview

This document describes the **intelligent and smart** spam prevention system implemented for both the **Pokemon card creator** (`/creator`) and **Yu-Gi-Oh card creator** (`/yugioh/create`) routes to prevent abuse and ensure quality content creation. The system goes beyond simple rule-based filtering to include machine learning concepts, adaptive behavior analysis, and intelligent pattern recognition.

## 🧠 **Intelligent Features Overview**

### 1. **Adaptive Thresholds**

- **Dynamic Rate Limiting**: Rate limits automatically adjust based on user reputation
- **Content Quality Thresholds**: Quality requirements adapt to user behavior
- **Suspicious Flag Thresholds**: Tolerance levels adjust based on user history

### 2. **User Reputation Scoring**

- **0-100 Reputation Scale**: Comprehensive scoring based on multiple factors
- **Success Rate Analysis**: Tracks successful vs. failed requests
- **Content Quality History**: Rolling average of content quality scores
- **Behavioral Pattern Recognition**: Identifies and tracks suspicious actions

### 3. **Content Quality Scoring**

- **Multi-Metric Analysis**: Readability, uniqueness, complexity, and relevance
- **Flesch Reading Ease**: Approximated readability scoring
- **Vocabulary Diversity**: Measures content uniqueness and variety
- **Adaptive Quality Requirements**: Thresholds adjust based on user reputation

### 4. **Anomaly Detection**

- **Timing Anomalies**: Detects unusual request patterns
- **Content Anomalies**: Identifies content that deviates from user's normal quality
- **Behavioral Anomalies**: Recognizes suspicious behavior patterns
- **Weighted Scoring**: Combines multiple anomaly factors for comprehensive detection

### 5. **Machine Learning Concepts**

- **Pattern Weighting**: Different patterns have different importance scores
- **Context-Aware Detection**: Thresholds adapt based on content length and context
- **Behavioral Learning**: System learns from user behavior over time
- **Adaptive Filtering**: Spam detection becomes more sophisticated with usage

### 6. **Profanity Detection** 🚫

- **Leo-Profanity Integration**: Uses the `leo-profanity` npm package for comprehensive profanity detection
- **Multi-Language Support**: Detects inappropriate language across multiple languages
- **Configurable Actions**: Choose to block, flag, or warn users about profanity
- **Threshold Control**: Set how many profane words trigger action
- **Real-time Filtering**: Immediate detection and response to inappropriate content

## System Architecture

### 1. Frontend Validation (Client-Side)

#### **Pokemon Card Creator** (`SaveToGalleryButton` component)

**Features**:

- **Content Quality Validation**: Ensures minimum and maximum length requirements
- **Pattern Detection**: Identifies suspicious content patterns
- **Spam Keyword Filtering**: Blocks common spam words and phrases
- **Repetitive Content Detection**: Prevents low-quality repetitive submissions
- **Field-Specific Validation**: Comprehensive validation for all card components

#### **Yu-Gi-Oh Card Creator** (`useYugiohCardEditor` hook)

**Features**:

- **Card Title Validation**: Length and spam pattern detection
- **Card Type Validation**: Ensures valid Monster/Spell/Trap types
- **Description Validation**: Content quality and spam keyword filtering
- **Monster-Specific Validation**: ATK/DEF, Level, Pendulum scales
- **Custom Race Validation**: Spam pattern detection in custom fields

#### **Validation Rules**

**Pokemon Cards**:

- **Card Name**: 2-50 characters, no repetitive characters, no spam patterns
- **Description**: 10-1000 characters, unique word ratio > 30%, no spam keywords
- **Moves & Abilities**: 2-30 chars name, 10-200 chars description
- **Numeric Fields**: HP (10-999), Retreat Cost (0-5), Weakness (1-5), Resistance (10-100)

**Yu-Gi-Oh Cards**:

- **Card Title**: 2-100 characters, no repetitive characters, no spam patterns
- **Description**: 10-2000 characters, unique word ratio > 40%, no spam keywords
- **Monster Stats**: ATK/DEF (0-9999), Level (1-12), Pendulum scales (1-13)
- **Custom Fields**: Custom race (2-50 chars), Pendulum info (5-500 chars)

### 2. Backend API Protection

#### **Pokemon Cards API** (`app/api/cards/route.ts`)

**Features**:

- **Intelligent Rate Limiting**: Adaptive thresholds based on user reputation
- **Content Quality Scoring**: ML-based content quality assessment
- **Enhanced Sanitization**: Comprehensive input sanitization
- **Authentication Required**: All requests must be authenticated
- **Error Handling**: Detailed error messages with quality scores

#### **Yu-Gi-Oh Cards API** (`app/api/yugioh-cards/route.ts`)

**Features**:

- **Intelligent Rate Limiting**: Same adaptive system as Pokemon cards
- **Yu-Gi-Oh Specific Validation**: Card type, monster stats, pendulum properties
- **Content Quality Scoring**: ML-based quality assessment for Yu-Gi-Oh content
- **Enhanced Sanitization**: Comprehensive sanitization for all Yu-Gi-Oh fields
- **Authentication Required**: All requests must be authenticated

#### **Intelligent Rate Limiting Configuration**

**Pokemon Cards**:

- **Per Minute**: 5 cards per minute per user (adjustable based on reputation)
- **Per Hour**: 30 cards per hour per user (adaptive burst capacity)
- **Per Day**: 200 cards per day per user (flexible for legitimate users)

**Yu-Gi-Oh Cards**:

- **Per Minute**: 5 cards per minute per user (adjustable based on reputation)
- **Per Hour**: 30 cards per hour per user (adaptive burst capacity)
- **Per Day**: 200 cards per day per user (flexible for legitimate users)

**Adaptive Multipliers**: Trusted users get 1.5x limits, suspicious users get 0.5x limits

#### **API Response Headers**

```
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1640995200000
Retry-After: 60
X-Content-Quality: 85
X-User-Reputation: 78
```

### 3. Intelligent Spam Prevention Middleware

**Location**: `src/middleware/spam-prevention.ts`

**Features**:

- **Multi-level Rate Limiting**: Minute, hour, and daily limits with adaptive thresholds
- **User Behavior Analysis**: Advanced pattern recognition and anomaly detection
- **Content Quality Scoring**: Multi-metric content quality assessment
- **User Agent Filtering**: Intelligent bot and scraper detection
- **Configurable Intelligence**: Enable/disable specific intelligent features

#### **Configuration Options**

```typescript
export interface SpamPreventionConfig {
  // Rate limiting
  maxRequestsPerMinute: number; // Default: 10
  maxRequestsPerHour: number; // Default: 100
  maxRequestsPerDay: number; // Default: 1000

  // Content validation
  minContentLength: number; // Default: 10
  maxContentLength: number; // Default: 10000
  maxRepetitiveCharacters: number; // Default: 5
  maxRepetitiveWords: number; // Default: 3

  // Suspicious pattern detection
  suspiciousPatterns: RegExp[]; // Custom patterns
  spamKeywords: string[]; // Blocked keywords

  // User behavior analysis
  maxFailedAttempts: number; // Default: 5
  suspiciousUserAgentPatterns: RegExp[]; // Bot detection

  // Image validation
  maxImageSize: number; // Default: 10MB
  allowedImageTypes: string[]; // Allowed formats

  // Intelligent features
  enableAdaptiveThresholds: boolean; // Default: true
  enableUserReputation: boolean; // Default: true
  enableContentQualityScoring: boolean; // Default: true
  enableBehavioralAnalysis: boolean; // Default: true
  enableAnomalyDetection: boolean; // Default: true

  // Profanity detection
  enableProfanityFilter: boolean; // Default: true
  profanityAction: 'block' | 'flag' | 'warn'; // Default: 'block'
  profanityThreshold: number; // Default: 0 (any profanity triggers action)
}
```

#### **Profanity Detection Configuration**

The profanity detection system provides three configurable actions:

- **`block`**: Completely blocks submissions containing profanity (default)
- **`flag`**: Allows submission but logs profanity for review
- **`warn`**: Shows warning but allows submission to proceed

**Example Configurations**:

```typescript
// Strict profanity filtering (default)
const strictConfig = {
  ...defaultSpamConfig,
  enableProfanityFilter: true,
  profanityAction: 'block',
  profanityThreshold: 0, // Any profanity blocks submission
};

// Moderate profanity filtering
const moderateConfig = {
  ...defaultSpamConfig,
  enableProfanityFilter: true,
  profanityAction: 'warn',
  profanityThreshold: 1, // One profane word triggers warning
};

// Monitoring-only profanity filtering
const monitorConfig = {
  ...defaultSpamConfig,
  enableProfanityFilter: true,
  profanityAction: 'flag',
  profanityThreshold: 2, // Two profane words trigger flagging
};
```

#### **Intelligent Pattern Detection**

**Character Patterns**:

- 6+ consecutive repeated characters (adaptive based on content length)
- All letters or all numbers
- Excessive punctuation

**Content Patterns**:

- Repetitive words (adaptive unique ratio thresholds)
- Multiple spam keywords (context-aware thresholds)
- Generic placeholder text

**User Behavior Patterns**:

- Rapid-fire requests (adaptive timing thresholds)
- Suspicious user agents (bots, scrapers)
- Excessive failed attempts
- Anomaly detection (timing, content, behavior)

## 🎯 **Intelligent Detection Capabilities**

### 1. **Content Quality Scoring Algorithm**

```typescript
interface ContentQualityMetrics {
  readability: number; // 0-100 (Flesch Reading Ease approximation)
  uniqueness: number; // 0-100 (vocabulary diversity)
  complexity: number; // 0-100 (word length and variety)
  relevance: number; // 0-100 (content structure and length)
  overallScore: number; // 0-100 (weighted average)
}
```

**Scoring Factors**:

- **Readability**: Sentence length, word complexity, syllable count
- **Uniqueness**: Vocabulary diversity, repeated word ratio
- **Complexity**: Word length variety, content structure
- **Relevance**: Content length, sentence count, unique word density

### 2. **User Reputation Algorithm**

```typescript
function calculateUserReputation(profile: UserBehaviorProfile): number {
  let reputation = 50; // Base neutral score

  // Success rate impact (0-30 points)
  reputation += successRate * 30;

  // Suspicious behavior penalty (0-50 points)
  reputation -= suspiciousFlags * 10;

  // Content quality bonus (0-20 points)
  reputation += averageQualityScore / 2;

  // Activity bonus (0-5 points)
  if (recentActivity) reputation += 5;

  return Math.max(0, Math.min(100, reputation));
}
```

**Reputation Factors**:

- **Success Rate**: Percentage of successful vs. failed requests
- **Content Quality**: Rolling average of content quality scores
- **Suspicious Actions**: Count and types of suspicious behaviors
- **Activity Level**: Recent activity and engagement

### 3. **Anomaly Detection Algorithm**

```typescript
interface AnomalyScore {
  timingAnomaly: number; // 0-100 (request timing patterns)
  contentAnomaly: number; // 0-100 (content quality deviation)
  behaviorAnomaly: number; // 0-100 (behavioral pattern changes)
  overallAnomaly: number; // 0-100 (weighted combination)
}
```

**Anomaly Factors**:

- **Timing**: Deviation from user's normal request timing
- **Content**: Quality score deviation from user's normal content
- **Behavior**: Suspicious flags and failed attempts ratio

### 4. **Adaptive Thresholds**

```typescript
interface AdaptiveThresholds {
  rateLimitMultiplier: number; // 0.5x to 1.5x based on reputation
  contentQualityThreshold: number; // 20-50 based on reputation
  suspiciousFlagThreshold: number; // 3-7 based on user history
}
```

**Threshold Adjustments**:

- **High Reputation (80+)**:
  - Rate limits: 1.5x normal
  - Quality threshold: 20 (more lenient)
  - Flag threshold: 7 (more tolerant)
- **Low Reputation (30-)**:
  - Rate limits: 0.5x normal
  - Quality threshold: 50 (stricter)
  - Flag threshold: 3 (less tolerant)
- **Average Reputation (30-80)**:
  - Rate limits: 1.0x normal
  - Quality threshold: 30 (standard)
  - Flag threshold: 5 (standard)

## Implementation Details

### Frontend Validation Flow

#### **Pokemon Cards**:

1. **User Input**: User fills out Pokemon card creation form
2. **Real-time Validation**: Validation runs on each field change
3. **Save Attempt**: User clicks "Save to Gallery"
4. **Comprehensive Check**: Full validation runs before submission
5. **Error Display**: Validation errors shown to user
6. **API Call**: Only valid data sent to backend

#### **Yu-Gi-Oh Cards**:

1. **User Input**: User fills out Yu-Gi-Oh card creation form
2. **Real-time Validation**: Validation runs on each field change
3. **Save Attempt**: User clicks save button
4. **Comprehensive Check**: Full validation runs before submission
5. **Error Display**: Validation errors shown to user
6. **API Call**: Only valid data sent to backend

### Backend Intelligent Validation Flow

#### **Pokemon Cards**:

1. **Authentication**: Verify user session
2. **User Profile Analysis**: Load user behavior profile and reputation
3. **Intelligent Rate Limiting**: Check adaptive rate limits
4. **Content Quality Scoring**: ML-based content quality assessment
5. **Anomaly Detection**: Detect unusual patterns and behaviors
6. **Adaptive Validation**: Apply reputation-based validation thresholds
7. **Database Storage**: Save validated card data
8. **Profile Update**: Update user behavior and reputation scores

#### **Yu-Gi-Oh Cards**:

1. **Authentication**: Verify user session
2. **User Profile Analysis**: Load user behavior profile and reputation
3. **Intelligent Rate Limiting**: Check adaptive rate limits
4. **Content Quality Scoring**: ML-based content quality assessment
5. **Anomaly Detection**: Detect unusual patterns and behaviors
6. **Adaptive Validation**: Apply reputation-based validation thresholds
7. **Yu-Gi-Oh Specific Validation**: Card type, monster stats, pendulum properties
8. **Database Storage**: Save validated card data
9. **Profile Update**: Update user behavior and reputation scores

### Middleware Integration

```typescript
// Pokemon cards API route with intelligent features
export const POST = withSpamPrevention(handleCardCreation, cardSpamConfig, {
  requireAuth: true,
  validateContent: true,
  contentField: 'description',
});

// Yu-Gi-Oh cards API route with intelligent features
export const POST = withSpamPrevention(
  handleYugiohCardCreation,
  yugiohCardSpamConfig,
  {
    requireAuth: true,
    validateContent: true,
    contentField: 'cardInfo',
  },
);
```

### 3. **Profanity Detection Implementation**

#### **Leo-Profanity Integration**

The system uses the `leo-profanity` npm package for comprehensive profanity detection:

```typescript
import { check } from 'leo-profanity';

function detectProfanity(content: string, config: SpamPreventionConfig) {
  if (!config.enableProfanityFilter) {
    return { hasProfanity: false, profaneWords: [], action: 'warn' };
  }

  const profaneWords: string[] = [];
  const words = content.toLowerCase().split(/\s+/);

  words.forEach(word => {
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord && check(cleanWord)) {
      profaneWords.push(cleanWord);
    }
  });

  const hasProfanity = profaneWords.length > config.profanityThreshold;

  return {
    hasProfanity,
    profaneWords: [...new Set(profaneWords)], // Remove duplicates
    action: config.profanityAction,
  };
}
```

#### **Frontend Profanity Detection**

Both Pokemon and Yu-Gi-Oh card editors include real-time profanity detection:

```typescript
// Pokemon card validation
if (check(cardOptions.name)) {
  errors.push('Card name contains inappropriate language');
}

if (check(cardOptions.description)) {
  errors.push('Description contains inappropriate language');
}

// Yu-Gi-Oh card validation
if (check(cardData.cardTitle)) {
  errors.push('Card title contains inappropriate language');
}

if (check(cardData.cardInfo)) {
  errors.push('Card description contains inappropriate language');
}
```

#### **Backend Profanity Validation**

The spam prevention middleware automatically checks all content for profanity:

```typescript
// Content validation with profanity detection
const contentValidation = validateContent(content, config, user?.id);
if (!contentValidation.isValid) {
  // Check if profanity was detected
  if (contentValidation.profanityCheck?.hasProfanity) {
    if (contentValidation.profanityCheck.action === 'block') {
      errorMessage = 'Content contains inappropriate language';
      errorDetails = contentValidation.errors.filter(error =>
        error.includes('inappropriate language'),
      );
    }
  }

  return NextResponse.json(
    {
      error: errorMessage,
      message: 'Content does not meet quality standards',
      details: errorDetails,
      profanityDetected:
        contentValidation.profanityCheck?.hasProfanity || false,
      profaneWords: contentValidation.profanityCheck?.profaneWords || [],
    },
    { status: 400 },
  );
}
```

#### **Profanity Detection Features**

- **Multi-Language Support**: Detects profanity in multiple languages
- **Context-Aware**: Considers word boundaries and punctuation
- **Duplicate Prevention**: Removes duplicate profane word entries
- **Configurable Sensitivity**: Adjustable threshold for action triggering
- **Real-Time Response**: Immediate feedback to users
- **Comprehensive Coverage**: Checks all text fields (names, descriptions, custom fields)

## 🔬 **Advanced Analytics & Monitoring**

### 1. **User Behavior Analytics**

```typescript
export function getUserBehaviorAnalytics(userId: string): {
  profile: UserBehaviorProfile;
  contentQualityTrend: number[];
  behavioralPatterns: any;
  anomalyScore?: AnomalyScore;
};
```

**Analytics Data**:

- **Content Quality Trends**: Rolling 20-score history
- **Behavioral Patterns**: Request timing, error patterns, suspicious actions
- **Anomaly Scores**: Real-time anomaly detection results
- **Reputation History**: Reputation score changes over time

### 2. **Rate Limit Status with Intelligence**

```typescript
export function getUserRateLimitStatus(userId: string): {
  remaining: number;
  resetTime: number;
  suspicious: boolean;
  reputationScore: number;
  contentQualityThreshold: number;
  rateLimitMultiplier: number;
};
```

**Status Information**:

- **Current Limits**: Remaining requests and reset times
- **Reputation Score**: Current user reputation (0-100)
- **Adaptive Thresholds**: Current quality and rate limit multipliers
- **Suspicious Status**: Whether user is flagged as suspicious

### 3. **Performance Metrics**

- **Validation Success Rate**: Percentage of successful validations
- **Content Quality Distribution**: Distribution of quality scores
- **Anomaly Detection Rate**: Frequency of anomaly detection
- **User Reputation Distribution**: Distribution of reputation scores
- **Rate Limit Effectiveness**: Success rate of rate limiting

## 🚀 **Configuration and Tuning**

### 1. **Intelligent Feature Tuning**

```typescript
// Enable/disable specific intelligent features
const cardSpamConfig = {
  ...defaultSpamConfig,
  enableAdaptiveThresholds: true, // Dynamic rate limiting
  enableUserReputation: true, // Reputation-based scoring
  enableContentQualityScoring: true, // ML-based quality assessment
  enableBehavioralAnalysis: true, // Behavior pattern recognition
  enableAnomalyDetection: true, // Anomaly detection
};
```

### 2. **Content Quality Tuning**

```typescript
// Adjust quality scoring parameters
const qualityConfig = {
  minContentLength: 10, // Minimum content length
  maxContentLength: 1000, // Maximum content length
  qualityThresholds: {
    low: 20, // Threshold for trusted users
    medium: 30, // Threshold for average users
    high: 50, // Threshold for suspicious users
  },
};
```

### 3. **Reputation System Tuning**

```typescript
// Adjust reputation calculation weights
const reputationConfig = {
  successRateWeight: 30, // Impact of success rate
  suspiciousPenalty: 10, // Penalty per suspicious action
  qualityBonusWeight: 0.5, // Quality score bonus multiplier
  activityBonus: 5, // Recent activity bonus
  decayRate: 0.1, // Reputation decay per day
};
```

### 4. **Anomaly Detection Tuning**

```typescript
// Adjust anomaly detection sensitivity
const anomalyConfig = {
  timingWeight: 0.3, // Weight for timing anomalies
  contentWeight: 0.4, // Weight for content anomalies
  behaviorWeight: 0.3, // Weight for behavior anomalies
  threshold: 80, // Overall anomaly threshold
  sensitivity: 'medium', // low, medium, high
};
```

## 🔮 **Future Enhancements**

### 1. **Machine Learning Integration**

- **Content Quality Models**: Train models on high-quality vs. low-quality content
- **User Behavior Prediction**: Predict user behavior based on historical patterns
- **Spam Pattern Learning**: Automatically detect new spam patterns
- **Quality Score Optimization**: Continuously improve quality scoring algorithms

### 2. **Advanced Analytics**

- **Predictive Analytics**: Predict potential abuse before it happens
- **User Segmentation**: Different rules for different user types
- **Trend Analysis**: Identify emerging abuse patterns
- **Performance Optimization**: ML-based validation optimization

### 3. **Real-time Intelligence**

- **Live Pattern Recognition**: Real-time detection of new patterns
- **Dynamic Rule Generation**: Automatically create new validation rules
- **Adaptive Learning**: System learns and adapts in real-time
- **Collaborative Intelligence**: Share intelligence across multiple instances

## 📊 **Performance and Scalability**

### 1. **Memory Management**

- **Efficient Data Structures**: Optimized storage for user profiles
- **Automatic Cleanup**: Periodic cleanup of old data
- **Memory Limits**: Configurable memory usage limits
- **LRU Caching**: Least recently used data eviction

### 2. **Processing Optimization**

- **Async Processing**: Non-blocking validation and analysis
- **Batch Operations**: Group similar operations for efficiency
- **Caching Strategies**: Cache validation results and user profiles
- **Lazy Loading**: Load data only when needed

### 3. **Scalability Considerations**

- **Redis Integration**: Replace in-memory storage with Redis
- **Distributed Processing**: Scale across multiple instances
- **Load Balancing**: Distribute spam prevention across servers
- **Database Optimization**: Optimize database queries and indexing

## 🎯 **Conclusion**

The intelligent spam prevention system represents a significant advancement over traditional rule-based systems. By incorporating machine learning concepts, adaptive thresholds, user reputation scoring, and anomaly detection, the system provides comprehensive protection for both **Pokemon** and **Yu-Gi-Oh** card creation routes.

### **Key Benefits**:

- **Smarter Detection**: Goes beyond simple pattern matching to understand context
- **Adaptive Protection**: Adjusts to user behavior and reputation automatically
- **Quality Assurance**: Ensures content meets quality standards for both card types
- **Better User Experience**: Legitimate users get more lenient treatment
- **Scalable Intelligence**: System grows smarter with usage
- **Reduced False Positives**: Context-aware detection reduces unnecessary blocks
- **Unified Protection**: Same intelligent system protects both card creation routes

### **System Design Principles**:

- **Intelligent**: Uses advanced algorithms and ML concepts
- **Adaptive**: Learns and adjusts to changing patterns
- **Efficient**: Minimal performance impact on legitimate requests
- **Configurable**: Easy to adjust and tune
- **Maintainable**: Clear structure and comprehensive documentation
- **Scalable**: Handles increased load and new abuse patterns

Regular monitoring and tuning ensure the system continues to provide intelligent protection while maintaining user satisfaction and system performance across both card creation platforms.
