// Basic engagement tracking utilities
// Used to track user interactions and activity

export interface UserEngagementMetrics {
  totalActions: number;
  actionsByType: Record<string, number>;
  lastActivity: Date | null;
}

export interface UserEngagementData {
  userId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface EngagementTracker {
  trackUserAction(data: Omit<UserEngagementData, 'timestamp'>): Promise<void>;
  getUserEngagementMetrics(userId: string): Promise<UserEngagementMetrics>;
  trackPageView(userId: string, page: string): Promise<void>;
}

// Simple in-memory engagement tracker for demo purposes
class InMemoryEngagementTracker implements EngagementTracker {
  private events: UserEngagementData[] = [];

  async trackUserAction(
    data: Omit<UserEngagementData, 'timestamp'>,
  ): Promise<void> {
    this.events.push({
      ...data,
      timestamp: new Date(),
    });
  }

  async getUserEngagementMetrics(
    userId: string,
  ): Promise<UserEngagementMetrics> {
    const userEvents = this.events.filter(e => e.userId === userId);
    return {
      totalActions: userEvents.length,
      actionsByType: userEvents.reduce((acc, event) => {
        acc[event.action] = (acc[event.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastActivity:
        userEvents.length > 0
          ? userEvents[userEvents.length - 1].timestamp
          : null,
    };
  }

  async trackPageView(userId: string, page: string): Promise<void> {
    await this.trackUserAction({
      userId,
      action: 'page_view',
      targetType: 'page',
      targetId: page,
    });
  }
}

// Export singleton instance
export const engagementTracker = new InMemoryEngagementTracker();

// Legacy exports for backwards compatibility
export { engagementTracker as default };
