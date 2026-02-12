import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { cards, marketplaceListings } from '../../../../src/db';
import { and, eq, sql } from 'drizzle-orm';
import { auth } from '../../../../auth';
import { dbUtils } from '../../../../src/db/utils';
import { notificationService } from '../../../../src/services/notification-service';
import { CreditService } from '../../../../src/services/credit-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbUtils.ensurePerformanceIndexes();
    const { id } = await params;
    const listingId = parseInt(id, 10);
    if (!Number.isFinite(listingId))
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const rows = await db
      .select({
        id: marketplaceListings.id,
        cardId: marketplaceListings.cardId,
        priceCredits: marketplaceListings.priceCredits,
        status: marketplaceListings.status,
        sellerUserId: marketplaceListings.sellerUserId,
        buyerUserId: marketplaceListings.buyerUserId,
        createdAt: marketplaceListings.createdAt,
        cardName: cards.name,
        cardType: cards.type,
        cardSubtype: cards.subtype,
        cardSupertype: cards.supertype,
        cardRarity: cards.rarity,
        // Additional card fields for display
        name: cards.name,
        type: cards.type,
        subtype: cards.subtype,
        supertype: cards.supertype,
        rarity: cards.rarity,
        hitpoints: cards.hitpoints,
        isPublic: cards.isPublic,
        imageData: cards.imageData,
        cardEditorState: cards.cardEditorState,
        illustrator: cards.illustrator,
        description: cards.description,
        dexStats: cards.dexStats,
        ability: cards.ability,
        moves: cards.moves,
        primaryImage: sql<string>`(COALESCE((${cards.imageData} -> 'generated' ->> 0), NULL))`,
        primaryThumb: sql<string>`(COALESCE((${cards.imageData} -> 'thumbs' ->> 0), NULL))`,
      })
      .from(marketplaceListings)
      .innerJoin(cards, eq(cards.id, marketplaceListings.cardId))
      .where(eq(marketplaceListings.id, listingId))
      .limit(1);
    const listing = rows[0];
    if (!listing)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(
      { data: listing },
      {
        headers: {
          'Cache-Control':
            'public, max-age=15, s-maxage=30, stale-while-revalidate=120',
        },
      },
    );
  } catch (e) {
    console.error('[marketplace:id] GET error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// Cancel listing (seller only) OR purchase (buyer) OR update price (seller)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    dbUtils.validateEnv();
    await dbUtils.ensurePerformanceIndexes();
    const session = await auth();
    const currentUser = session?.user;
    if (!currentUser)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const listingId = parseInt(id, 10);
    if (!Number.isFinite(listingId))
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    const body = await request.json().catch(() => ({} as any));
    const action = (body?.action || '').toString();
    if (action !== 'cancel' && action !== 'buy' && action !== 'update_price')
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, listingId))
      .limit(1);
    if (!listing)
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (action !== 'update_price' && listing.status !== 'active')
      return NextResponse.json(
        { error: 'Listing is not active' },
        { status: 409 },
      );
    if (action === 'update_price') {
      if (listing.sellerUserId !== currentUser.id!)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const priceCredits = parseInt(body?.priceCredits || '0', 10);
      if (!Number.isFinite(priceCredits) || priceCredits <= 0)
        return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
      const res = await db
        .update(marketplaceListings)
        .set({ priceCredits, updatedAt: new Date() })
        .where(
          and(
            eq(marketplaceListings.id, listingId),
            eq(marketplaceListings.sellerUserId, currentUser.id!),
          ),
        );
      return NextResponse.json({ success: (res.rowCount ?? 0) > 0 });
    }

    if (action === 'cancel') {
      if (listing.sellerUserId !== currentUser.id!)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      const res = await db
        .update(marketplaceListings)
        .set({ status: 'canceled', updatedAt: new Date() })
        .where(
          and(
            eq(marketplaceListings.id, listingId),
            eq(marketplaceListings.sellerUserId, currentUser.id!),
          ),
        );
      return NextResponse.json({ success: (res.rowCount ?? 0) > 0 });
    }

    // action === 'buy'
    if (listing.sellerUserId === currentUser.id!)
      return NextResponse.json(
        { error: 'Cannot buy your own listing' },
        { status: 400 },
      );

    // Use CreditService for secure transaction handling
    const deductResult = await CreditService.deductCredits({
      userId: currentUser.id!,
      amount: listing.priceCredits,
      reason: 'market_buy',
    });

    if (!deductResult.success) {
      return NextResponse.json(
        { error: deductResult.error || 'Purchase failed' },
        { status: 409 },
      );
    }

    try {
      // Update listing status and transfer card atomically
      const result = await db.execute(sql`
        WITH mark_sold AS (
          UPDATE marketplace_listings
          SET status = 'sold', buyer_user_id = ${currentUser.id}, sold_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${listingId} AND status = 'active'
          RETURNING card_id, seller_user_id, price_credits
        ),
        transfer_card AS (
          UPDATE cards
          SET user_id = ${currentUser.id}, updated_at = CURRENT_TIMESTAMP
          FROM mark_sold
          WHERE cards.id = mark_sold.card_id
          RETURNING cards.id
        )
        SELECT 
          mark_sold.card_id,
          mark_sold.seller_user_id,
          mark_sold.price_credits,
          (transfer_card.id IS NOT NULL) as transfer_ok
        FROM mark_sold
        LEFT JOIN transfer_card ON transfer_card.id = mark_sold.card_id
      `);

      const purchaseResult = result?.rows?.[0];
      if (!purchaseResult?.transfer_ok) {
        // Refund the buyer if listing update/card transfer failed
        await CreditService.refundTransaction(
          currentUser.id!,
          deductResult.transactionId!,
          'purchase_failed',
        );
        return NextResponse.json({ error: 'Purchase failed' }, { status: 409 });
      }

      // Add credits to seller (minus 10% fee)
      const sellerAmount = Math.floor(listing.priceCredits * 0.9);
      await CreditService.addCredits({
        userId: listing.sellerUserId,
        amount: sellerAmount,
        reason: 'market_sale',
      });
    } catch (error) {
      console.error('Purchase transaction failed:', error);
      // Refund the buyer on any failure
      if (deductResult.transactionId) {
        await CreditService.refundTransaction(
          currentUser.id!,
          deductResult.transactionId,
          'purchase_failed',
        );
      }
      return NextResponse.json({ error: 'Purchase failed' }, { status: 500 });
    }

    // Create notification for the seller
    try {
      const [cardInfo] = await db
        .select({
          cardName: cards.name,
        })
        .from(cards)
        .where(eq(cards.id, listing.cardId))
        .limit(1);

      if (cardInfo) {
        await notificationService.notifyCardSold(
          listing.sellerUserId,
          currentUser.id!,
          listingId,
          cardInfo.cardName,
          currentUser.name || currentUser.email || undefined,
          listing.priceCredits,
        );
      }
    } catch (error) {
      console.error('Failed to create sale notification:', error);
      // Don't fail the transaction for notification errors
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[marketplace:id] POST error', e);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
