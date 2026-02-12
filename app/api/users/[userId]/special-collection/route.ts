import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { SpecialCollectionService } from '../../../../../src/features/special-collection/service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const session = await auth();
    // For future use when privacy settings are implemented
    // const currentUser = session?.user;
    // const _isOwnerRequest = currentUser && userId === currentUser.id;

    // For now, we'll allow public access to special collections
    // In the future, we might want to add privacy settings for special collections
    const collection = await SpecialCollectionService.getUserCollection(userId);

    // For non-owner requests, we might want to add additional filtering in the future
    // For now, special collections are considered public since they're special achievements

    return NextResponse.json({
      collection,
      message:
        collection.length === 0 ? 'No special cards claimed yet' : undefined,
    });
  } catch (error) {
    console.error('[Special Collection] GET user collection error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special collection' },
      { status: 500 },
    );
  }
}
