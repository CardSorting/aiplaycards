import { and, count, desc, eq } from 'drizzle-orm';
import { db } from '../index';
import { cardComments, cardLikes, follows } from '../schema';

export const followQueries = {
  follow: async (
    followerUserId: string,
    followingUserId: string,
  ): Promise<boolean> => {
    if (
      !followerUserId ||
      !followingUserId ||
      followerUserId === followingUserId
    )
      return false;
    try {
      await db
        .insert(follows)
        .values({ followerUserId, followingUserId })
        .onConflictDoNothing();
      return true;
    } catch {
      return false;
    }
  },
  unfollow: async (
    followerUserId: string,
    followingUserId: string,
  ): Promise<boolean> => {
    const res = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerUserId, followerUserId),
          eq(follows.followingUserId, followingUserId),
        ),
      );
    return (res.rowCount ?? 0) > 0;
  },
  isFollowing: async (
    followerUserId: string,
    followingUserId: string,
  ): Promise<boolean> => {
    const rows = await db
      .select({})
      .from(follows)
      .where(
        and(
          eq(follows.followerUserId, followerUserId),
          eq(follows.followingUserId, followingUserId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  },
  counts: async (
    userId: string,
  ): Promise<{ followers: number; following: number }> => {
    const [followersRow] = await db
      .select({ c: count() })
      .from(follows)
      .where(eq(follows.followingUserId, userId));
    const [followingRow] = await db
      .select({ c: count() })
      .from(follows)
      .where(eq(follows.followerUserId, userId));
    return {
      followers: Number(followersRow?.c || 0),
      following: Number(followingRow?.c || 0),
    };
  },
};

export const cardLikeQueries = {
  like: async (cardId: number, userId: string): Promise<boolean> => {
    try {
      await db
        .insert(cardLikes)
        .values({ cardId, userId })
        .onConflictDoNothing();
      return true;
    } catch {
      return false;
    }
  },
  unlike: async (cardId: number, userId: string): Promise<boolean> => {
    const res = await db
      .delete(cardLikes)
      .where(and(eq(cardLikes.cardId, cardId), eq(cardLikes.userId, userId)));
    return (res.rowCount ?? 0) > 0;
  },
  isLiked: async (cardId: number, userId: string): Promise<boolean> => {
    const rows = await db
      .select({})
      .from(cardLikes)
      .where(and(eq(cardLikes.cardId, cardId), eq(cardLikes.userId, userId)))
      .limit(1);
    return rows.length > 0;
  },
  count: async (cardId: number): Promise<number> => {
    const [row] = await db
      .select({ c: count() })
      .from(cardLikes)
      .where(eq(cardLikes.cardId, cardId));
    return Number(row?.c || 0);
  },
};

export const cardCommentQueries = {
  list: async (cardId: number, limit = 20, offset = 0) => {
    const safeLimit = Math.max(1, Math.min(50, Math.floor(limit)));
    const safeOffset = Math.max(0, Math.floor(offset));
    return db
      .select()
      .from(cardComments)
      .where(eq(cardComments.cardId, cardId))
      .orderBy(desc(cardComments.createdAt))
      .limit(safeLimit)
      .offset(safeOffset);
  },
  add: async (cardId: number, userId: string, content: string) => {
    const [row] = await db
      .insert(cardComments)
      .values({ cardId, userId, content })
      .returning();
    return row;
  },
  remove: async (commentId: number, userId: string): Promise<boolean> => {
    const res = await db
      .delete(cardComments)
      .where(
        and(eq(cardComments.id, commentId), eq(cardComments.userId, userId)),
      );
    return (res.rowCount ?? 0) > 0;
  },
  count: async (cardId: number): Promise<number> => {
    const [row] = await db
      .select({ c: count() })
      .from(cardComments)
      .where(eq(cardComments.cardId, cardId));
    return Number(row?.c || 0);
  },
};
