// Simple in-memory rate limiting for community submissions
// In production, this should use Redis or database for persistence and clustering support

interface RateLimitEntry {
  userId: string;
  submissions: number;
  windowStart: number;
}

class RateLimitService {
  private static submissionLimits: Map<string, RateLimitEntry> = new Map();

  // Rate limits
  private static readonly MAX_SUBMISSIONS_PER_HOUR = 3;
  private static readonly MAX_SUBMISSIONS_PER_DAY = 10;
  private static readonly WINDOW_HOUR = 60 * 60 * 1000; // 1 hour
  private static readonly WINDOW_DAY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Check if user can submit to community pool
   */
  static canSubmitToCommunity(userId: string): {
    allowed: boolean;
    message?: string;
  } {
    const now = Date.now();
    const existingEntry = this.submissionLimits.get(userId);

    if (!existingEntry) {
      // No previous submissions, allow
      return { allowed: true };
    }

    // Count submissions in current hour window
    const hourAgo = now - this.WINDOW_HOUR;
    const dayAgo = now - this.WINDOW_DAY;

    let hourlyCount = 0;
    let dailyCount = 0;

    // In a real implementation, this would query the database
    // For now, we use the in-memory state
    if (existingEntry.windowStart > hourAgo) {
      hourlyCount = existingEntry.submissions;
    }
    if (existingEntry.windowStart > dayAgo) {
      dailyCount = existingEntry.submissions;
    }

    if (dailyCount >= this.MAX_SUBMISSIONS_PER_DAY) {
      const resetTime = new Date(existingEntry.windowStart + this.WINDOW_DAY);
      const timeUntilReset = Math.ceil(
        (resetTime.getTime() - now) / (60 * 1000),
      ); // minutes
      return {
        allowed: false,
        message: `You've reached the daily limit (${this.MAX_SUBMISSIONS_PER_DAY} cards). Try again in ${timeUntilReset} minutes.`,
      };
    }

    if (hourlyCount >= this.MAX_SUBMISSIONS_PER_HOUR) {
      const resetTime = new Date(existingEntry.windowStart + this.WINDOW_HOUR);
      const timeUntilReset = Math.ceil(
        (resetTime.getTime() - now) / (60 * 1000),
      ); // minutes
      return {
        allowed: false,
        message: `You've reached the hourly limit (${this.MAX_SUBMISSIONS_PER_HOUR} cards). Try again in ${timeUntilReset} minutes.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Record a community submission (in production, this would log to database)
   */
  static recordCommunitySubmission(userId: string): void {
    const now = Date.now();
    const existingEntry = this.submissionLimits.get(userId);

    if (!existingEntry) {
      // First submission
      this.submissionLimits.set(userId, {
        userId,
        submissions: 1,
        windowStart: now,
      });
      return;
    }

    // Increment counter
    existingEntry.submissions += 1;

    // Reset window if it's a new day
    const dayAgo = now - this.WINDOW_DAY;
    if (existingEntry.windowStart <= dayAgo) {
      existingEntry.windowStart = now;
      existingEntry.submissions = 1;
    }

    this.submissionLimits.set(userId, existingEntry);

    // Cleanup old entries periodically
    this.cleanupOldEntries();
  }

  /**
   * Clean up expired rate limit entries
   */
  private static cleanupOldEntries(): void {
    const now = Date.now();
    const dayAgo = now - this.WINDOW_DAY;

    for (const [userId, entry] of this.submissionLimits.entries()) {
      if (entry.windowStart <= dayAgo) {
        this.submissionLimits.delete(userId);
      }
    }
  }
}

export { RateLimitService };
