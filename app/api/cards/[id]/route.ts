import { NextRequest, NextResponse } from 'next/server';
import { cardQueries } from '../../../../src/db/queries';
import { dbUtils } from '../../../../src/db/utils';
import { backblazeStorage } from '../../../../src/utils/storage/backblaze';
import type { UpdateCardRequest } from '../../../../src/db/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Validate database connection
    dbUtils.validateEnv();

    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Card ID must be a number' },
        { status: 400 },
      );
    }

    const card = await cardQueries.getById(cardId);

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        data: card,
      },
      {
        headers: {
          'Cache-Control':
            'public, max-age=60, s-maxage=120, stale-while-revalidate=300',
          Vary: 'Accept-Encoding',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Validate database connection
    dbUtils.validateEnv();

    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Card ID must be a number' },
        { status: 400 },
      );
    }

    const updateData: Partial<UpdateCardRequest> = await request.json();

    // Remove id from update data if present
    delete updateData.id;

    // Sanitize string inputs
    if (updateData.name) {
      updateData.name = dbUtils.sanitizeString(updateData.name);
    }
    if (updateData.description) {
      updateData.description = dbUtils.sanitizeString(
        updateData.description,
        1000,
      );
    }

    // If updating imageData, handle dataUrl → WebP upload to object storage and merge
    if (updateData.imageData) {
      const existing = await cardQueries.getById(cardId);
      const existingImageData = (existing?.imageData ?? {}) as any;
      const incomingImageData = updateData.imageData as any;

      let uploadedMainUrl: string | null = null;
      let uploadedThumbUrl: string | null = null;

      // If a canvas dataUrl is provided, transcode to WebP and upload
      if (incomingImageData.dataUrl) {
        try {
          if (backblazeStorage.isConfigured()) {
            const { url, thumbUrl } =
              await backblazeStorage.uploadImageVariantsFromDataUrl(
                incomingImageData.dataUrl,
                {
                  keyPrefix: `cards/${cardId}`,
                  webpQuality: 82,
                  thumbWidth: 480,
                },
              );
            uploadedMainUrl = url;
            uploadedThumbUrl = thumbUrl;
          }
        } catch (e) {
          console.error('Failed to upload image to object storage:', e);
          // If upload fails, we intentionally do not persist dataUrl to DB to avoid huge rows
        }
      }

      // Build merged imageData. If upload failed or storage is not configured,
      // keep the incoming dataUrl so the gallery can display the captured image.
      const nextGenerated: string[] = [];
      const nextThumbs: string[] = [];

      if (uploadedMainUrl) nextGenerated.push(uploadedMainUrl);
      if (Array.isArray(incomingImageData.generated))
        nextGenerated.push(...incomingImageData.generated);
      if (Array.isArray(existingImageData.generated))
        nextGenerated.push(...existingImageData.generated);

      if (uploadedThumbUrl) nextThumbs.push(uploadedThumbUrl);
      if (Array.isArray(incomingImageData.thumbs))
        nextThumbs.push(...incomingImageData.thumbs);
      if (Array.isArray(existingImageData.thumbs))
        nextThumbs.push(...existingImageData.thumbs);

      // De-duplicate while preserving order (newest first)
      const dedup = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
      const mergedGenerated = dedup(nextGenerated);
      const mergedThumbs = dedup(nextThumbs);

      const { dataUrl: incomingDataUrl, ...incomingRest } = incomingImageData;

      // Keep dataUrl only when we couldn't persist to object storage
      const shouldKeepDataUrl =
        !uploadedMainUrl &&
        typeof incomingDataUrl === 'string' &&
        incomingDataUrl.startsWith('data:');

      updateData.imageData = {
        ...existingImageData,
        ...incomingRest,
        ...(shouldKeepDataUrl ? { dataUrl: incomingDataUrl } : {}),
        ...(mergedGenerated.length > 0 ? { generated: mergedGenerated } : {}),
        ...(mergedThumbs.length > 0 ? { thumbs: mergedThumbs } : {}),
      } as any;
    }

    const updatedCard = await cardQueries.update(cardId, updateData as any);

    if (!updatedCard) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedCard,
    });
  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      {
        error: 'Failed to update card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Validate database connection
    dbUtils.validateEnv();

    const { id } = await params;
    const cardId = parseInt(id, 10);
    if (Number.isNaN(cardId)) {
      return NextResponse.json(
        { error: 'Card ID must be a number' },
        { status: 400 },
      );
    }

    const deleted = await cardQueries.delete(cardId);

    if (!deleted) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
