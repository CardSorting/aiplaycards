import { getUserBehaviorStore, getUserProfile } from './storage';

/**
 * Utility function to check if a user is marked as suspicious
 */
export function isUserSuspicious(userId: string): boolean {
  const userBehavior = getUserBehaviorStore().get(userId);
  return (
    (userBehavior?.suspiciousFlags || 0) >
    (userBehavior?.adaptiveThresholds.suspiciousFlagThreshold || 5)
  );
}

/**
 * Utility function to mark a user as suspicious
 */
export function markUserSuspicious(userId: string, reason?: string): void {
  const userBehavior =
    getUserBehaviorStore().get(userId) || getUserProfile(userId);
  userBehavior.suspiciousFlags++;
  if (reason) {
    userBehavior.behavioralPatterns.suspiciousActions.push(reason);
  }
  getUserBehaviorStore().set(userId, userBehavior);

  if (reason) {
    console.warn(
      `[SpamPrevention] User ${userId} marked as suspicious: ${reason}`,
    );
  }
}
