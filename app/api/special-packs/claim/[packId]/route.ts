import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { SpecialPackService } from '../../../../../src/features/special-packs/service';

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

    const result = await SpecialPackService.claimPack(session.user.id, packId);

    if (result.success) {
      return NextResponse.json({
        message: 'Pack claimed successfully!',
        pack: result.pack,
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('[PlayMore Packs] POST claim pack error:', error);
    return NextResponse.json(
      { error: 'Failed to claim pack' },
      { status: 500 },
    );
  }
}
