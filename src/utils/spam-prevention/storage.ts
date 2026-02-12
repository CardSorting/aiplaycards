import { UserBehaviorProfile } from '../../types/spam-prevention';

// In-memory stores for rate limiting and user behavior tracking
// In production, use Redis or similar persistent storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const userBehaviorStore = new Map<string, UserBehaviorProfile>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
  for (const [key, value] of userBehaviorStore.entries()) {
    if (now > value.lastActivity + 24 * 60 * 60 * 1000) {
      // 24 hours
      userBehaviorStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

/**
 * Get or create user behavior profile
 */
export function getUserProfile(userId: string): UserBehaviorProfile {
  let profile = userBehaviorStore.get(userId);

  if (!profile) {
    profile = {
      userId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      suspiciousFlags: 0,
      lastActivity: Date.now(),
      reputationScore: 50, // Default neutral reputation
      contentQualityScores: [],
      behavioralPatterns: {
        requestTiming: [],
        contentVariety: 0,
        errorPatterns: [],
        suspiciousActions: [],
      },
      adaptiveThresholds: {
        rateLimitMultiplier: 1.0,
        contentQualityThreshold: 30,
        suspiciousFlagThreshold: 5,
      },
    };
    userBehaviorStore.set(userId, profile);
  }

  return profile;
}

/**
 * Update user profile with new activity
 */
export function updateUserProfile(
  userId: string,
  success: boolean,
  contentQuality?: number,
  suspiciousAction?: string,
): void {
  const profile = getUserProfile(userId);
  const now = Date.now();

  profile.totalRequests++;
  profile.lastActivity = now;

  if (success) {
    profile.successfulRequests++;
  } else {
    profile.failedRequests++;
  }

  if (contentQuality !== undefined) {
    profile.contentQualityScores.push(contentQuality);
    // Keep only last 20 scores for rolling average
    if (profile.contentQualityScores.length > 20) {
      profile.contentQualityScores.shift();
    }
  }

  if (suspiciousAction) {
    profile.suspiciousFlags++;
    profile.behavioralPatterns.suspiciousActions.push(suspiciousAction);
  }

  // Update reputation score
  profile.reputationScore = calculateUserReputation(profile);

  // Update adaptive thresholds based on reputation
  if (profile.reputationScore > 80) {
    profile.adaptiveThresholds.rateLimitMultiplier = 1.5; // Trusted users get higher limits
    profile.adaptiveThresholds.contentQualityThreshold = 20; // Lower quality threshold for trusted users
  } else if (profile.reputationScore < 30) {
    profile.adaptiveThresholds.rateLimitMultiplier = 0.5; // Suspicious users get lower limits
    profile.adaptiveThresholds.contentQualityThreshold = 50; // Higher quality threshold for suspicious users
  } else {
    profile.adaptiveThresholds.rateLimitMultiplier = 1.0; // Default for average users
    profile.adaptiveThresholds.contentQualityThreshold = 30;
  }

  userBehaviorStore.set(userId, profile);
}

/**
 * Calculate user reputation score based on behavior
 */
function calculateUserReputation(profile: UserBehaviorProfile): number {
  const successRate =
    profile.totalRequests > 0
      ? profile.successfulRequests / profile.totalRequests
      : 0;
  const suspiciousPenalty = profile.suspiciousFlags * 10;
  const qualityBonus =
    profile.contentQualityScores.length > 0
      ? profile.contentQualityScores.reduce((a, b) => a + b, 0) /
        profile.contentQualityScores.length /
        2
      : 0;

  let reputation = 50; // Base score

  // Success rate impact
  reputation += successRate * 30;

  // Suspicious behavior penalty
  reputation -= suspiciousPenalty;

  // Content quality bonus
  reputation += qualityBonus;

  // Activity bonus (active users get slight bonus)
  const daysSinceLastActivity =
    (Date.now() - profile.lastActivity) / (24 * 60 * 60 * 1000);
  if (daysSinceLastActivity < 7) reputation += 5;

  return Math.max(0, Math.min(100, reputation));
}

/**
 * Get rate limit store for external access
 */
export function getRateLimitStore() {
  return rateLimitStore;
}

/**
 * Get user behavior store for external access
 */
export function getUserBehaviorStore() {
  return userBehaviorStore;
}

/**
 * Reset user behavior tracking
 */
export function resetUserBehavior(userId: string): void {
  userBehaviorStore.delete(userId);
}
