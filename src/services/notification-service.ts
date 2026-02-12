// Notification service for managing user notifications and welcome messages

class NotificationService {
  /**
   * Get welcome message for new users
   */
  getWelcomeMessage(creditsAwarded: number): string {
    if (creditsAwarded === 0) {
      return '';
    }

    return `🎉 Welcome to PlayMoreTCG! You've received ${creditsAwarded} free credits to start collecting cards.`;
  }

  /**
   * Get booster unlock message
   */
  getBoosterUnlockMessage(creditsAwarded: number): string {
    if (creditsAwarded === 0) {
      return '';
    }

    return `🔓 You've unlocked your first booster pack with ${creditsAwarded} credits! Try opening a pack now.`;
  }

  /**
   * Get onboarding tips for new users
   */
  getOnboardingTips(): string[] {
    return [
      'Start by exploring different booster packs',
      'Each pack contains unique AI-generated cards',
      'Create your own gallery to showcase your favorites',
      'Trade with other collectors and build your collection',
      'Use your free credits to start creating cards',
    ];
  }

  /**
   * Create notification object
   */
  createNotification({
    userId,
    type,
    title,
    message,
    actionUrl,
  }: {
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
  }) {
    return {
      userId,
      type,
      title,
      message,
      actionUrl,
      createdAt: new Date(),
      isRead: false,
    };
  }
}

export const notificationService = new NotificationService();
