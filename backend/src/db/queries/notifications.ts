import { and, count, desc, eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { cards, notifications, users } from '../schema';
import type { NewNotification, Notification } from '../schema';

export const notificationQueries = {
  /**
   * Create a new notification
   */
  create: async (
    notification: NewNotification,
  ): Promise<Notification | null> => {
    try {
      const [created] = await db
        .insert(notifications)
        .values(notification)
        .returning();
      return created || null;
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  },

  /**
   * Get notifications for a user with pagination
   */
  list: async (
    userId: string,
    options: { limit?: number; offset?: number; unreadOnly?: boolean } = {},
  ): Promise<Notification[]> => {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    const whereConditions = [eq(notifications.userId, userId)];

    if (unreadOnly) {
      whereConditions.push(eq(notifications.isRead, false));
    }

    const query = db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
        fromUserId: notifications.fromUserId,
        cardId: notifications.cardId,
        listingId: notifications.listingId,
        fromUsername: users.username,
        cardName: cards.name,
      })
      .from(notifications)
      .leftJoin(users, eq(notifications.fromUserId, users.userId))
      .leftJoin(cards, eq(notifications.cardId, cards.id))
      .where(and(...whereConditions));

    return query
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  },

  /**
   * Get unread notification count for a user
   */
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const [result] = await db
        .select({ count: count() })
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, userId),
            eq(notifications.isRead, false),
          ),
        );

      // Ensure we always return a number, never null or undefined
      const countValue = result?.count;
      if (
        countValue === null ||
        countValue === undefined ||
        typeof countValue !== 'number'
      ) {
        return 0;
      }
      return Math.max(0, Math.floor(countValue));
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  },

  /**
   * Mark notifications as read
   */
  markAsRead: async (
    userId: string,
    notificationIds?: number[],
  ): Promise<boolean> => {
    try {
      const whereConditions = [eq(notifications.userId, userId)];

      if (notificationIds && notificationIds.length > 0) {
        whereConditions.push(
          sql`${notifications.id} = ANY(${notificationIds})`,
        );
      }

      const query = db
        .update(notifications)
        .set({ isRead: true })
        .where(and(...whereConditions));

      await query;
      return true;
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
      return false;
    }
  },

  /**
   * Create a follower notification
   */
  createFollowerNotification: async (
    followingUserId: string,
    followerUserId: string,
    followerUsername?: string,
  ): Promise<Notification | null> => {
    const displayName = followerUsername || 'Someone';
    return notificationQueries.create({
      userId: followingUserId,
      type: 'follower',
      title: 'New Follower',
      message: `${displayName} started following you!`,
      fromUserId: followerUserId,
    });
  },

  /**
   * Create a like notification
   */
  createLikeNotification: async (
    cardOwnerId: string,
    likerUserId: string,
    cardId: number,
    cardName?: string,
    likerUsername?: string,
  ): Promise<Notification | null> => {
    // Don't notify users about their own likes
    if (cardOwnerId === likerUserId) return null;

    const displayName = likerUsername || 'Someone';
    const displayCardName = cardName || 'your card';

    return notificationQueries.create({
      userId: cardOwnerId,
      type: 'like',
      title: 'Card Liked',
      message: `${displayName} liked ${displayCardName}!`,
      fromUserId: likerUserId,
      cardId,
    });
  },

  /**
   * Create a sale notification
   */
  createSaleNotification: async (
    sellerUserId: string,
    buyerUserId: string,
    listingId: number,
    cardName?: string,
    buyerUsername?: string,
    amount?: number,
  ): Promise<Notification | null> => {
    const displayName = buyerUsername || 'Someone';
    const displayCardName = cardName || 'your card';
    const amountText = amount ? ` for ${amount} credits` : '';

    return notificationQueries.create({
      userId: sellerUserId,
      type: 'sale',
      title: 'Card Sold',
      message: `${displayName} bought ${displayCardName}${amountText}!`,
      fromUserId: buyerUserId,
      listingId,
    });
  },

  /**
   * Delete old notifications (cleanup)
   */
  deleteOld: async (daysOld = 30): Promise<number> => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await db
        .delete(notifications)
        .where(sql`${notifications.createdAt} < ${cutoffDate}`);

      return result.rowCount || 0;
    } catch (error) {
      console.error('Failed to delete old notifications:', error);
      return 0;
    }
  },
};
