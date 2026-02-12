import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../../../src/db';
import { follows } from '../../../../../src/db/schema/follows';
import { authUsers } from '../../../../../src/db/schema/auth';
import { auth } from '../../../../../auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { userId } = await params;
    const targetUserId = userId;

    if (currentUserId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 },
      );
    }

    // Check if target user exists
    const targetUser = await db
      .select({ id: authUsers.id })
      .from(authUsers)
      .where(eq(authUsers.id, targetUserId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await db
      .select({ followerUserId: follows.followerUserId })
      .from(follows)
      .where(
        and(
          eq(follows.followerUserId, currentUserId),
          eq(follows.followingUserId, targetUserId),
        ),
      )
      .limit(1);

    if (existingFollow.length > 0) {
      return NextResponse.json(
        { error: 'Already following this user' },
        { status: 409 },
      );
    }

    // Add follow
    await db.insert(follows).values({
      followerUserId: currentUserId,
      followingUserId: targetUserId,
    });

    return NextResponse.json({
      success: true,
      isFollowing: true,
    });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json(
      { error: 'Failed to follow user' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { userId } = await params;
    const targetUserId = userId;

    // Remove follow
    const result = await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerUserId, currentUserId),
          eq(follows.followingUserId, targetUserId),
        ),
      )
      .returning({ followerUserId: follows.followerUserId });

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Follow relationship not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      isFollowing: false,
    });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json(
      { error: 'Failed to unfollow user' },
      { status: 500 },
    );
  }
}
