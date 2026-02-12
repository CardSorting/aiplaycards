import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { SpecialPackService } from '../../../../../src/features/special-packs/service';

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
    const packId = parseInt(resolvedParams.id);

    if (isNaN(packId)) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
    }

    const pack = await SpecialPackService.getPackDetails(
      session.user.id,
      packId,
    );

    if (!pack) {
      return NextResponse.json(
        { error: 'Pack not found or access denied' },
        { status: 404 },
      );
    }

    return NextResponse.json({ pack });
  } catch (error) {
    console.error('[PlayMore Packs] GET pack details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pack details' },
      { status: 500 },
    );
  }
}
