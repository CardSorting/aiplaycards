import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { YugiohCardService } from '../../../../src/services/yugioh-card-service';
import { YugiohCardData } from '../../../../src/features/yugiohEditor/types';

// GET - Get a specific Yu-Gi-Oh card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const resolvedParams = await params;
    const cardId = parseInt(resolvedParams.id);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
    }

    // Allow viewing public cards without auth, but require auth for private cards
    const card = await YugiohCardService.getCardById(cardId, session?.user?.id);

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    // If card is not public and user doesn't own it, deny access
    if (!card.isPublic && card.userId !== session?.user?.id) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('Error getting Yu-Gi-Oh card:', error);
    return NextResponse.json({ error: 'Failed to get card' }, { status: 500 });
  }
}

// PUT - Update a Yu-Gi-Oh card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const cardId = parseInt(resolvedParams.id);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
    }

    const body = await request.json();
    const { cardData, imageDataUrl } = body;

    if (!cardData) {
      return NextResponse.json(
        { error: 'Card data is required' },
        { status: 400 },
      );
    }

    const updatedCard = await YugiohCardService.updateCard(
      cardId,
      session.user.id,
      cardData as YugiohCardData,
      imageDataUrl,
    );

    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Card not found or you do not have permission to update it' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
    });
  } catch (error) {
    console.error('Error updating Yu-Gi-Oh card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 },
    );
  }
}

// DELETE - Delete a Yu-Gi-Oh card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const cardId = parseInt(resolvedParams.id);

    if (isNaN(cardId)) {
      return NextResponse.json({ error: 'Invalid card ID' }, { status: 400 });
    }

    const success = await YugiohCardService.deleteCard(cardId, session.user.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Card not found or you do not have permission to delete it' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting Yu-Gi-Oh card:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 },
    );
  }
}
