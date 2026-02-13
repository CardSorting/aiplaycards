import { NextRequest, NextResponse } from 'next/server';
import { cardCommentQueries } from '../../../../../src/db/queries';
import { dbUtils } from '../../../../../src/db/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    dbUtils.validateEnv();
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId))
      return NextResponse.json(
        { success: false, error: 'Invalid card id' },
        { status: 400 },
      );
    const list = await cardCommentQueries.list(cardId, limit, offset);
    return NextResponse.json({ success: true, data: list });
  } catch (e) {
    console.error('[comments] GET error', e);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    dbUtils.validateEnv();
    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId))
      return NextResponse.json(
        { success: false, error: 'Invalid card id' },
        { status: 400 },
      );
    const body = await request.json().catch(() => ({}));
    const content = (body?.content || '').toString().trim();
    const userId = body?.userId;
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 },
      );
    if (!content)
      return NextResponse.json(
        { success: false, error: 'Content required' },
        { status: 400 },
      );
    const row = await cardCommentQueries.add(cardId, userId, content);
    return NextResponse.json({ success: true, data: row });
  } catch (e) {
    console.error('[comments] POST error', e);
    return NextResponse.json(
      { success: false, error: 'Failed to add comment' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    dbUtils.validateEnv();
    const url = new URL(request.url);
    const commentId = parseInt(url.searchParams.get('commentId') || '', 10);
    const userId = url.searchParams.get('userId');
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 401 },
      );
    if (Number.isNaN(commentId))
      return NextResponse.json(
        { success: false, error: 'Invalid comment id' },
        { status: 400 },
      );
    const ok = await cardCommentQueries.remove(commentId, userId);
    return NextResponse.json({ success: ok });
  } catch (e) {
    console.error('[comments] DELETE error', e);
    return NextResponse.json(
      { success: false, error: 'Failed to delete comment' },
      { status: 500 },
    );
  }
}
