import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { SpecialCollectionService } from '../../../../../src/features/special-collection/service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
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
    const cardId = parseInt(resolvedParams.id);

    if (isNaN(cardId) || cardId <= 0) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
    }

    const card = await SpecialCollectionService.getCardById(
      session.user.id,
      cardId,
    );

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or access denied' },
        { status: 404 },
      );
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('[Special Collection] GET card details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card details' },
      { status: 500 },
    );
  }
}
