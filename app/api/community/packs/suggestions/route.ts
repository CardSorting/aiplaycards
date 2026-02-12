import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { CommunityPackService } from '../../../../../src/features/admin-packs/service';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get suggestions (can be viewed by all authenticated users)
    // For now, return empty array since method doesn't exist yet
    return NextResponse.json({
      suggestions: [],
      message: 'Community suggestions feature coming soon',
    });
  } catch (error) {
    console.error('[Community Packs] GET suggestions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      packType,
      suggestedCardCount,
      suggestedDistribution,
    } = body;

    if (!name || !suggestedCardCount) {
      return NextResponse.json(
        {
          error: 'Missing required fields: name, suggestedCardCount',
        },
        { status: 400 },
      );
    }

    const suggestion = {
      name,
      description,
      packType: packType || 'manual',
      suggestedCardCount,
      suggestedDistribution: suggestedDistribution || {},
    };

    const result = await CommunityPackService.createPackSuggestion(
      session.user.id,
      suggestion,
    );

    if (result.success && result.data) {
      return NextResponse.json({
        message: 'Suggestion submitted successfully',
        suggestionId: result.data.suggestionId,
      });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    console.error('[Community Packs] POST suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to submit suggestion' },
      { status: 500 },
    );
  }
}
