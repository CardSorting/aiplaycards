import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import {
  backblazeStorage,
  generateMTGCardFileName,
  validateBackblazeConfig,
} from '../../../../src/utils/backblaze';

export async function POST(request: NextRequest) {
  try {
    // Validate user authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Validate Backblaze configuration
    validateBackblazeConfig();

    const formData = await request.formData();
    const imageData = formData.get('imageData') as string;
    const cardName = (formData.get('cardName') as string) || 'untitled';

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 },
      );
    }

    // Validate image data format
    if (!imageData.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 },
      );
    }

    // Generate unique filename
    const fileName = generateMTGCardFileName(session.user.id, cardName);

    // Upload to Backblaze
    const imageUrl = await backblazeStorage.uploadBase64Image(
      imageData,
      fileName,
    );

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName,
    });
  } catch (error) {
    console.error('MTG image upload error:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload image',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
