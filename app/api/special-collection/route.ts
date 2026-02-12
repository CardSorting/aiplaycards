import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { SpecialCollectionService } from '../../../src/features/special-collection/service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const collection = await SpecialCollectionService.getUserCollection(
      session.user.id,
    );

    return NextResponse.json({
      collection,
      message:
        collection.length === 0 ? 'No special cards claimed yet' : undefined,
    });
  } catch (error) {
    console.error('[Special Collection] GET collection error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch special collection' },
      { status: 500 },
    );
  }
}
