import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { SpecialCollectionService } from '../../../../../src/features/special-collection/service';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ packId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const resolvedParams = await params;
    const packId = parseInt(resolvedParams.packId);

    if (isNaN(packId)) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
    }

    const result = await SpecialCollectionService.claimPack(
      session.user.id,
      packId,
    );

    if (result.success) {
      return NextResponse.json({
        message: 'Pack claimed successfully!',
        packClaimId: result.packClaimId,
        claimedCards: result.claimedCards,
        redirectUrl: result.redirectUrl,
        cardsCount: result.claimedCards?.length || 0,
      });
    } else {
      const statusCode = result.error?.includes('already been claimed')
        ? 409
        : 400;
      return NextResponse.json(
        {
          error: result.error,
          redirectUrl: result.redirectUrl,
        },
        { status: statusCode },
      );
    }
  } catch (error) {
    console.error('[Special Collection] POST claim pack error:', error);
    return NextResponse.json(
      { error: 'Failed to claim pack' },
      { status: 500 },
    );
  }
}
