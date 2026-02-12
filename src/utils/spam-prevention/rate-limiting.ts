import {
  RateLimitResult,
  SpamPreventionConfig,
} from '../../types/spam-prevention';
import { getRateLimitStore, getUserProfile } from './storage';

/**
 * Check rate limits with adaptive thresholds
 */
export function checkRateLimit(
  userId: string,
  config: SpamPreventionConfig,
): RateLimitResult {
  const now = Date.now();
  const profile = getUserProfile(userId);
  const multiplier = profile.adaptiveThresholds.rateLimitMultiplier;
  const rateLimitStore = getRateLimitStore();

  const minuteKey = `${userId}:minute:${Math.floor(now / (60 * 1000))}`;
  const hourKey = `${userId}:hour:${Math.floor(now / (60 * 60 * 1000))}`;
  const dayKey = `${userId}:day:${Math.floor(now / (24 * 60 * 60 * 1000))}`;

  // Apply adaptive thresholds
  const adjustedMinuteLimit = Math.round(
    config.maxRequestsPerMinute * multiplier,
  );
  const adjustedHourLimit = Math.round(config.maxRequestsPerHour * multiplier);
  const adjustedDayLimit = Math.round(config.maxRequestsPerDay * multiplier);

  // Check per-minute rate limit
  const minuteLimit = rateLimitStore.get(minuteKey);
  if (!minuteLimit || now > minuteLimit.resetTime) {
    rateLimitStore.set(minuteKey, { count: 1, resetTime: now + 60 * 1000 });
  } else if (minuteLimit.count >= adjustedMinuteLimit) {
    return { allowed: false, remaining: 0, resetTime: minuteLimit.resetTime };
  } else {
    minuteLimit.count++;
  }

  // Check per-hour rate limit
  const hourLimit = rateLimitStore.get(hourKey);
  if (!hourLimit || now > hourLimit.resetTime) {
    rateLimitStore.set(hourKey, { count: 1, resetTime: now + 60 * 60 * 1000 });
  } else if (hourLimit.count >= adjustedHourLimit) {
    return { allowed: false, remaining: 0, resetTime: hourLimit.resetTime };
  } else {
    hourLimit.count++;
  }

  // Check per-day rate limit
  const dayLimit = rateLimitStore.get(dayKey);
  if (!dayLimit || now > dayLimit.resetTime) {
    rateLimitStore.set(dayKey, {
      count: 1,
      resetTime: now + 24 * 60 * 60 * 1000,
    });
  } else if (dayLimit.count >= adjustedDayLimit) {
    return { allowed: false, remaining: 0, resetTime: dayLimit.resetTime };
  } else {
    dayLimit.count++;
  }

  return {
    allowed: true,
    remaining: adjustedMinuteLimit - (minuteLimit?.count || 1),
    resetTime: now + 60 * 1000,
  };
}

/**
 * Get current rate limit status for a user with reputation info
 */
export function getUserRateLimitStatus(userId: string): {
  remaining: number;
  resetTime: number;
  suspicious: boolean;
  reputationScore: number;
  contentQualityThreshold: number;
  rateLimitMultiplier: number;
} {
  const now = Date.now();
  const minuteKey = `${userId}:minute:${Math.floor(now / (60 * 1000))}`;
  const minuteLimit = getRateLimitStore().get(minuteKey);
  const userBehavior = getUserProfile(userId);

  return {
    remaining: minuteLimit
      ? Math.round(10 * userBehavior.adaptiveThresholds.rateLimitMultiplier) -
        minuteLimit.count
      : Math.round(10 * userBehavior.adaptiveThresholds.rateLimitMultiplier),
    resetTime: minuteLimit ? minuteLimit.resetTime : now + 60 * 1000,
    suspicious:
      userBehavior.suspiciousFlags >
      userBehavior.adaptiveThresholds.suspiciousFlagThreshold,
    reputationScore: userBehavior.reputationScore,
    contentQualityThreshold:
      userBehavior.adaptiveThresholds.contentQualityThreshold,
    rateLimitMultiplier: userBehavior.adaptiveThresholds.rateLimitMultiplier,
  };
}
