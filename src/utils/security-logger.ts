/**
 * Comprehensive security logging and monitoring system
 * Tracks security events, suspicious activities, and system health
 */

export enum SecurityEventType {
  // Authentication events
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  LOGOUT = 'logout',
  SESSION_EXPIRED = 'session_expired',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',

  // Financial events
  CREDIT_TRANSACTION = 'credit_transaction',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_FAILED = 'payment_failed',
  SUSPICIOUS_TRANSACTION = 'suspicious_transaction',

  // Security violations
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  BRUTE_FORCE_ATTEMPT = 'brute_force_attempt',

  // System events
  API_ERROR = 'api_error',
  DATABASE_ERROR = 'database_error',
  EXTERNAL_SERVICE_ERROR = 'external_service_error',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
}

export enum SecurityEventSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface SecurityEvent {
  type: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: string;
  ip: string;
  userAgent: string;
  endpoint?: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Security event logger with automatic threat detection
 */
export class SecurityLogger {
  private static eventQueue: SecurityEvent[] = [];
  private static alertThresholds: Partial<
    Record<SecurityEventType, { count: number; window: number }>
  > = {
      [SecurityEventType.LOGIN_FAILURE]: { count: 5, window: 15 * 60 * 1000 }, // 5 failures in 15 min
      [SecurityEventType.RATE_LIMIT_EXCEEDED]: {
        count: 3,
        window: 5 * 60 * 1000,
      }, // 3 in 5 min
      [SecurityEventType.UNAUTHORIZED_ACCESS]: {
        count: 3,
        window: 10 * 60 * 1000,
      }, // 3 in 10 min
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: {
        count: 2,
        window: 5 * 60 * 1000,
      }, // 2 in 5 min
    };

  /**
   * Log a security event
   */
  static async logEvent(
    event: Partial<SecurityEvent> & {
      type: SecurityEventType;
      message: string;
      ip: string;
    },
  ): Promise<void> {
    const fullEvent: SecurityEvent = {
      severity: SecurityEventSeverity.LOW,
      userAgent: 'Unknown',
      timestamp: new Date(),
      ...event,
    };

    // Add to queue for processing
    this.eventQueue.push(fullEvent);

    // Immediate logging for critical events
    if (fullEvent.severity === SecurityEventSeverity.CRITICAL) {
      console.error(`[SecurityLogger] CRITICAL EVENT: ${fullEvent.message}`, {
        type: fullEvent.type,
        userId: fullEvent.userId,
        ip: fullEvent.ip,
        endpoint: fullEvent.endpoint,
        metadata: fullEvent.metadata,
      });
    } else if (fullEvent.severity === SecurityEventSeverity.HIGH) {
      console.warn(`[SecurityLogger] HIGH SEVERITY: ${fullEvent.message}`, {
        type: fullEvent.type,
        userId: fullEvent.userId,
        ip: fullEvent.ip,
      });
    }

    // Check for patterns that indicate attacks
    this.checkForAttackPatterns(fullEvent);

    // Process queue if it gets large
    if (this.eventQueue.length >= 10) {
      await this.flushEventQueue();
    }
  }

  /**
   * Check for attack patterns and trigger alerts
   */
  private static checkForAttackPatterns(event: SecurityEvent): void {
    const threshold = this.alertThresholds[event.type];
    if (!threshold) return;

    const now = Date.now();
    const windowStart = now - threshold.window;

    // Count recent events of the same type from the same IP
    const recentEvents = this.eventQueue.filter(
      e =>
        e.type === event.type &&
        e.ip === event.ip &&
        e.timestamp.getTime() >= windowStart,
    );

    if (recentEvents.length >= threshold.count) {
      this.logEvent({
        type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        severity: SecurityEventSeverity.HIGH,
        ip: event.ip,
        message: `Potential attack detected: ${recentEvents.length} ${event.type
          } events in ${threshold.window / 1000}s`,
        metadata: {
          originalEventType: event.type,
          eventCount: recentEvents.length,
          window: threshold.window,
          userIds: [
            ...new Set(recentEvents.map(e => e.userId).filter(Boolean)),
          ],
        },
      });
    }
  }

  /**
   * Process and persist event queue
   */
  private static async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // In production, you might want to store these in a dedicated security log table
      // For now, we'll use console logging with structured data
      for (const event of events) {
        if (
          event.severity === SecurityEventSeverity.HIGH ||
          event.severity === SecurityEventSeverity.CRITICAL
        ) {
          // Log high-severity events to external monitoring service
          await this.sendToExternalMonitoring(event);
        }
      }
    } catch (error) {
      console.error('[SecurityLogger] Failed to flush event queue:', error);
      // Re-add events to queue on failure
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  /**
   * Send critical events to external monitoring
   */
  private static async sendToExternalMonitoring(
    event: SecurityEvent,
  ): Promise<void> {
    // Implementation for external monitoring service (e.g., DataDog, New Relic, Sentry)
    // For now, we'll just log to console with structured format
    const logData = {
      timestamp: event.timestamp.toISOString(),
      level: event.severity,
      service: 'pokemon-app',
      event_type: event.type,
      user_id: event.userId,
      client_ip: event.ip,
      user_agent: event.userAgent,
      endpoint: event.endpoint,
      message: event.message,
      metadata: event.metadata,
    };

    console.log('[SecurityLogger] External monitoring event:', logData);
  }

  /**
   * Get security statistics for monitoring dashboard
   */
  static getSecurityStats(): {
    totalEvents: number;
    criticalEvents: number;
    recentSuspiciousIPs: string[];
    topEventTypes: Array<{ type: string; count: number }>;
  } {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    const recentEvents = this.eventQueue.filter(
      e => e.timestamp.getTime() >= last24Hours,
    );

    const criticalEvents = recentEvents.filter(
      e =>
        e.severity === SecurityEventSeverity.CRITICAL ||
        e.severity === SecurityEventSeverity.HIGH,
    ).length;

    const suspiciousIPs = [
      ...new Set(
        recentEvents
          .filter(e => e.type === SecurityEventType.SUSPICIOUS_ACTIVITY)
          .map(e => e.ip),
      ),
    ];

    const eventTypeCounts = recentEvents.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEventTypes = Object.entries(eventTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    return {
      totalEvents: recentEvents.length,
      criticalEvents,
      recentSuspiciousIPs: suspiciousIPs,
      topEventTypes,
    };
  }

  /**
   * Convenience methods for common security events
   */
  static async logLoginAttempt(
    success: boolean,
    userId: string | null,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.logEvent({
      type: success
        ? SecurityEventType.LOGIN_SUCCESS
        : SecurityEventType.LOGIN_FAILURE,
      severity: success
        ? SecurityEventSeverity.LOW
        : SecurityEventSeverity.MEDIUM,
      userId: userId || undefined,
      ip,
      userAgent,
      message: success ? 'User login successful' : 'User login failed',
    });
  }

  static async logUnauthorizedAccess(
    endpoint: string,
    userId: string | null,
    ip: string,
    userAgent: string,
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      severity: SecurityEventSeverity.HIGH,
      userId: userId || undefined,
      ip,
      userAgent,
      endpoint,
      message: `Unauthorized access attempt to ${endpoint}`,
    });
  }

  static async logCreditTransaction(
    userId: string,
    amount: number,
    reason: string,
    ip: string,
    success: boolean,
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.CREDIT_TRANSACTION,
      severity:
        Math.abs(amount) > 1000
          ? SecurityEventSeverity.MEDIUM
          : SecurityEventSeverity.LOW,
      userId,
      ip,
      userAgent: 'System',
      message: `Credit transaction: ${success ? 'success' : 'failed'
        } - ${amount} credits for ${reason}`,
      metadata: { amount, reason, success },
    });
  }

  static async logSuspiciousActivity(
    reason: string,
    ip: string,
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    await this.logEvent({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: SecurityEventSeverity.HIGH,
      userId,
      ip,
      userAgent: 'System',
      message: `Suspicious activity detected: ${reason}`,
      metadata,
    });
  }

}

// Auto-flush queue periodically
setInterval(async () => {
  await SecurityLogger['flushEventQueue']();
}, 30 * 1000); // Every 30 seconds
