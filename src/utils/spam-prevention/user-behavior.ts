import { NextRequest } from 'next/server';
import {
  AnomalyScore,
  SpamPreventionConfig,
  UserBehaviorAnalysisResult,
} from '../../types/spam-prevention';
import { getUserProfile, updateUserProfile } from './storage';

/**
 * Analyze user behavior for suspicious activity with enhanced intelligence
 */
export function analyzeUserBehavior(
  userId: string,
  request: NextRequest,
  config: SpamPreventionConfig,
): UserBehaviorAnalysisResult {
  const userAgent = request.headers.get('user-agent') || '';
  const _clientIP =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const profile = getUserProfile(userId);

  // Check user agent for suspicious patterns
  if (
    config.suspiciousUserAgentPatterns.some(pattern => pattern.test(userAgent))
  ) {
    updateUserProfile(userId, false, undefined, 'suspicious_user_agent');
    return { suspicious: true, reason: 'Suspicious user agent detected' };
  }

  // Check for rapid-fire requests with adaptive thresholds
  const now = Date.now();
  const timeSinceLastAttempt =
    profile.lastActivity > 0 ? now - profile.lastActivity : 1000;
  const rapidFireThreshold = profile.reputationScore > 80 ? 50 : 100; // Trusted users get more lenient threshold

  if (timeSinceLastAttempt < rapidFireThreshold) {
    updateUserProfile(userId, false, undefined, 'rapid_fire_requests');
    return { suspicious: true, reason: 'Rapid-fire requests detected' };
  }

  // Anomaly detection
  const anomalyScore = detectAnomalies(profile, request);
  if (anomalyScore.overallAnomaly > 80) {
    updateUserProfile(userId, false, undefined, 'high_anomaly_score');
    return {
      suspicious: true,
      reason: 'Unusual behavior pattern detected',
      anomalyScore: anomalyScore.overallAnomaly,
    };
  }

  // Update user behavior tracking
  profile.behavioralPatterns.requestTiming.push(timeSinceLastAttempt);
  if (profile.behavioralPatterns.requestTiming.length > 20) {
    profile.behavioralPatterns.requestTiming.shift();
  }

  return { suspicious: false };
}

/**
 * Detect anomalies in user behavior and content
 */
export function detectAnomalies(
  userProfile: any,
  request: NextRequest,
  content?: string,
): AnomalyScore {
  const now = Date.now();

  // Timing anomaly detection
  const recentRequests =
    userProfile.behavioralPatterns.requestTiming.slice(-10);
  const avgTiming =
    recentRequests.length > 0
      ? recentRequests.reduce((a: number, b: number) => a + b, 0) /
        recentRequests.length
      : 1000;
  const currentTiming =
    userProfile.lastActivity > 0 ? now - userProfile.lastActivity : 1000;
  const timingAnomaly = Math.min(
    100,
    (Math.abs(currentTiming - avgTiming) / avgTiming) * 100,
  );

  // Content anomaly detection
  let contentAnomaly = 0;
  if (content && userProfile.contentQualityScores.length > 0) {
    const avgQuality =
      userProfile.contentQualityScores.reduce(
        (a: number, b: number) => a + b,
        0,
      ) / userProfile.contentQualityScores.length;
    // For now, we'll use a simple content length-based quality score
    const currentQuality = Math.min(100, content.length / 10);
    contentAnomaly = Math.min(
      100,
      (Math.abs(currentQuality - avgQuality) / avgQuality) * 100,
    );
  }

  // Behavioral anomaly detection
  const behaviorAnomaly = Math.min(
    100,
    (userProfile.suspiciousFlags / 10) * 50 +
      (userProfile.failedRequests / Math.max(userProfile.totalRequests, 1)) *
        100,
  );

  // Overall anomaly score
  const overallAnomaly =
    timingAnomaly * 0.3 + contentAnomaly * 0.4 + behaviorAnomaly * 0.3;

  return {
    timingAnomaly: Math.round(timingAnomaly),
    contentAnomaly: Math.round(contentAnomaly),
    behaviorAnomaly: Math.round(behaviorAnomaly),
    overallAnomaly: Math.round(overallAnomaly),
  };
}

/**
 * Get comprehensive user behavior analytics
 */
export function getUserBehaviorAnalytics(userId: string): {
  profile: any;
  contentQualityTrend: number[];
  behavioralPatterns: any;
  anomalyScore?: AnomalyScore;
} {
  const profile = getUserProfile(userId);
  const anomalyScore = detectAnomalies(profile, {} as NextRequest);

  return {
    profile,
    contentQualityTrend: profile.contentQualityScores,
    behavioralPatterns: profile.behavioralPatterns,
    anomalyScore,
  };
}
