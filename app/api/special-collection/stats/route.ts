import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { SpecialCollectionService } from '../../../../src/features/special-collection/service';

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

    const stats = await SpecialCollectionService.getCollectionStats(
      session.user.id,
    );

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('[Special Collection] GET stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection stats' },
      { status: 500 },
    );
  }
}
