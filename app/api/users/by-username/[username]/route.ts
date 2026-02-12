import { NextRequest, NextResponse } from 'next/server';
import { userQueries } from '../../../../../src/db/queries';
import { dbUtils } from '../../../../../src/db/utils';

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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ username: string }> },
) {
  try {
    dbUtils.validateEnv();
    const { username: rawUsername } = await context.params;
    if (!rawUsername || typeof rawUsername !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Username is required' },
        { status: 400 },
      );
    }

    // Decode the username to handle URL-encoded usernames (e.g., "Bozo%20Egg" -> "Bozo Egg")
    const username = decodeURIComponent(rawUsername);

    // Try multiple username variations (URL-friendly -> original format)
    let user = null;
    const usernameCandidates = possibleUsernames(username);

    for (const candidate of usernameCandidates) {
      user = await userQueries.getByUsername(candidate);
      if (user) break;
    }
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 },
      );
    }

    // Only expose minimal public profile data
    return NextResponse.json({
      success: true,
      data: {
        userId: user.userId,
        username: user.username || username,
        createdAt: user.createdAt ?? null,
      },
    });
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 },
    );
  }
}
