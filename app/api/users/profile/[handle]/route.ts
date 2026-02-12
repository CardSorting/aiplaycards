import { NextRequest, NextResponse } from 'next/server';
import { followQueries, userQueries } from '../../../../../src/db/queries';
import { dbUtils } from '../../../../../src/db/utils';
import { auth } from '../../../../../auth';
import { notificationService } from '../../../../../src/services/notification-service';

// Helper function to convert URL-friendly username back to possible original formats
const possibleUsernames = (handle: string): string[] => {
  const candidates = [handle]; // Try as-is first

  // If it contains hyphens, try converting back to spaces
  if (handle.includes('-')) {
    candidates.push(handle.replace(/-/g, ' '));
  }

  // Try different case variations
  const titleCase = handle.replace(/\b\w/g, l => l.toUpperCase());
  if (titleCase !== handle) {
    candidates.push(titleCase);
    if (titleCase.includes('-')) {
      candidates.push(titleCase.replace(/-/g, ' '));
    }
  }

  return Array.from(new Set(candidates)); // Remove duplicates
};

// Flexible lookup: treat handle as username first, otherwise as userId
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    dbUtils.validateEnv();
    const { handle: rawHandle } = await context.params;
    if (!rawHandle || typeof rawHandle !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Handle is required' },
        { status: 400 },
      );
    }

    // Decode the handle to handle URL-encoded usernames (e.g., "Bozo%20Egg" -> "Bozo Egg")
    const handle = decodeURIComponent(rawHandle);

    // Try multiple username variations (URL-friendly -> original format)
    let user = null;
    const usernameCandidates = possibleUsernames(handle);

    for (const candidate of usernameCandidates) {
      user = await userQueries.getByUsername(candidate);
      if (user) break;
    }

    // If no username match, try as userId
    if (!user) {
      user = await userQueries.getByUserId(handle);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    // Get follow counts and whether current user follows
    let followers = 0;
    let following = 0;
    let isFollowing = false;
    try {
      const session = await auth();
      const currentUser = session?.user;
      const [counts, followingState] = await Promise.all([
        followQueries.counts(user.userId),
        currentUser
          ? followQueries.isFollowing(currentUser.id!, user.userId)
          : Promise.resolve(false),
      ]);
      followers = counts.followers;
      following = counts.following;
      isFollowing = Boolean(followingState);
      const cacheHeader = currentUser
        ? 'private, max-age=30, stale-while-revalidate=120'
        : 'public, max-age=60, s-maxage=300, stale-while-revalidate=900';
      // Build a public avatar URL (derived, no PII): prefer username; fallback to userId
      const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
        user.username || user.userId,
      )}&backgroundType=gradientLinear&fontWeight=700`;

      return NextResponse.json(
        {
          success: true,
          data: {
            userId: user.userId,
            username: user.username || null,
            createdAt: user.createdAt ?? null,
            avatarUrl,
            followers,
            following,
            isFollowing,
          },
        },
        {
          headers: {
            'Cache-Control': cacheHeader,
            Vary: currentUser ? 'Cookie' : 'Accept-Encoding',
          },
        },
      );
    } catch {}
    // Fallback when user state check fails: return public cacheable minimal info
    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
      user.username || user.userId,
    )}&backgroundType=gradientLinear&fontWeight=700`;
    return NextResponse.json(
      {
        success: true,
        data: {
          userId: user.userId,
          username: user.username || null,
          createdAt: user.createdAt ?? null,
          avatarUrl,
          followers,
          following,
          isFollowing,
        },
      },
      {
        headers: {
          'Cache-Control':
            'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching profile by handle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    dbUtils.validateEnv();
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );

    const { handle: rawHandle } = await context.params;
    const body = await request.json().catch(() => ({}));
    const newUsername = (body?.username || '').toString().trim();

    if (!newUsername) {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 },
      );
    }

    // Decode the handle to handle URL-encoded usernames
    const handle = decodeURIComponent(rawHandle);

    // Find the target user (must be the current user)
    let user = null;
    const usernameCandidates = possibleUsernames(handle);

    for (const candidate of usernameCandidates) {
      user = await userQueries.getByUsername(candidate);
      if (user) break;
    }

    // If no username match, try as userId
    if (!user) {
      user = await userQueries.getByUserId(handle);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    // Ensure user can only update their own profile
    if (user.userId !== currentUser.id!) {
      return NextResponse.json(
        { success: false, error: 'You can only update your own profile' },
        { status: 403 },
      );
    }

    // Use the secure atomic username update function
    const updateResult = await userQueries.updateUsername(
      currentUser.id!,
      newUsername,
    );

    if (!updateResult.success) {
      // Return appropriate HTTP status based on error type
      let status = 400;
      if (updateResult.error?.includes('already taken')) status = 409;
      else if (updateResult.error?.includes('reserved')) status = 400;
      else if (updateResult.error?.includes('not found')) status = 404;
      else status = 500;

      return NextResponse.json(
        {
          success: false,
          error: updateResult.error,
        },
        { status },
      );
    }

    if (!updateResult.user) {
      return NextResponse.json(
        { success: false, error: 'Failed to update username' },
        { status: 500 },
      );
    }

    // Build avatar URL with new username
    const avatarUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(
      newUsername,
    )}&backgroundType=gradientLinear&fontWeight=700`;

    return NextResponse.json({
      success: true,
      data: {
        userId: updateResult.user.userId,
        username: updateResult.user.username,
        createdAt: updateResult.user.createdAt,
        avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update username' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ handle: string }> },
) {
  try {
    dbUtils.validateEnv();
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser)
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    const { handle: rawHandle } = await context.params;
    const body = await request.json().catch(() => ({}));
    const action = (body?.action || '').toString();

    // Decode the handle to handle URL-encoded usernames (e.g., "Bozo%20Egg" -> "Bozo Egg")
    const handle = decodeURIComponent(rawHandle);

    // Try multiple username variations (URL-friendly -> original format)
    let target = null;
    const usernameCandidates = possibleUsernames(handle);

    for (const candidate of usernameCandidates) {
      target = await userQueries.getByUsername(candidate);
      if (target) break;
    }

    // If no username match, try as userId
    if (!target) {
      target = await userQueries.getByUserId(handle);
    }
    if (!target)
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    if (target.userId === currentUser.id!)
      return NextResponse.json(
        { success: false, error: 'Cannot follow yourself' },
        { status: 400 },
      );

    if (action === 'follow') {
      const followed = await followQueries.follow(
        currentUser.id!,
        target.userId,
      );

      // Create notification for the user being followed
      if (followed) {
        await notificationService.notifyNewFollower(
          target.userId,
          currentUser.id!,
          currentUser.name || currentUser.email || undefined,
        );
      }
    } else if (action === 'unfollow') {
      await followQueries.unfollow(currentUser.id!, target.userId);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 },
      );
    }

    const counts = await followQueries.counts(target.userId);
    const isFollowing = await followQueries.isFollowing(
      currentUser.id!,
      target.userId,
    );
    return NextResponse.json({
      success: true,
      data: {
        followers: counts.followers,
        following: counts.following,
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Error updating follow state:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update follow state' },
      { status: 500 },
    );
  }
}
