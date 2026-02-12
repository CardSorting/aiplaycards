import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../../../../src/db';
import { collectionComments } from '../../../../../src/db/schema/card-social';
import { users } from '../../../../../src/db/schema/users';
import { auth } from '../../../../../auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json(
        { error: 'Collection ID required' },
        { status: 400 },
      );
    }

    // Get comments for a specific collection with user details
    const comments = await db
      .select({
        id: collectionComments.id,
        content: collectionComments.content,
        createdAt: collectionComments.createdAt,
        updatedAt: collectionComments.updatedAt,
        user: {
          userId: users.userId,
          name: users.username,
        },
      })
      .from(collectionComments)
      .innerJoin(users, eq(collectionComments.userId, users.userId))
      .where(eq(collectionComments.collectionId, parseInt(collectionId)))
      .orderBy(desc(collectionComments.createdAt));

    return NextResponse.json({
      success: true,
      comments,
      count: comments.length,
    });
  } catch (error) {
    console.error('Collection comments fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collection comments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { collectionId, content } = await request.json();

    if (!collectionId || !content?.trim()) {
      return NextResponse.json(
        {
          error: 'Collection ID and comment content are required',
        },
        { status: 400 },
      );
    }

    if (content.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 1000 characters or less' },
        { status: 400 },
      );
    }

    // Create the comment
    const newComment = await db
      .insert(collectionComments)
      .values({
        collectionId: parseInt(collectionId),
        userId: session.user.id,
        content: content.trim(),
      })
      .returning({
        id: collectionComments.id,
        content: collectionComments.content,
        createdAt: collectionComments.createdAt,
        updatedAt: collectionComments.updatedAt,
      });

    return NextResponse.json({
      success: true,
      comment: newComment[0],
      message: 'Comment added successfully',
    });
  } catch (error) {
    console.error('Collection comment creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to add comment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID required' },
        { status: 400 },
      );
    }

    // Get the comment to check ownership
    const comment = await db
      .select()
      .from(collectionComments)
      .where(eq(collectionComments.id, parseInt(commentId)))
      .limit(1);

    if (!comment.length) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check if user owns the comment
    if (comment[0].userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 },
      );
    }

    // Delete the comment
    await db
      .delete(collectionComments)
      .where(eq(collectionComments.id, parseInt(commentId)));

    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Collection comment deletion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete comment',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
