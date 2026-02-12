import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { SpecialPackService } from '../../../../src/features/special-packs/service';

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

    const categories = await SpecialPackService.getAvailableCategories(
      session.user.id,
    );

    return NextResponse.json({
      categories,
      message:
        categories.length === 0
          ? 'No PlayMore packs available at this time'
          : undefined,
    });
  } catch (error) {
    console.error('[PlayMore Packs] GET categories error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PlayMore pack categories' },
      { status: 500 },
    );
  }
}
