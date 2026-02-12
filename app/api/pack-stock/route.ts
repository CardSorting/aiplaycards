import { NextResponse } from 'next/server';
import { PACKS } from '../../../src/features/booster/packs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET() {
  try {
    // For now, return a default stock count for the active pack
    // In the future, this could be replaced with actual database queries
    const stock: { [packSlug: string]: number } = {};

    // Set stock for active packs
    PACKS.forEach(pack => {
      // Default to 100 packs available for active packs
      stock[pack.slug] = 100;
    });

    return NextResponse.json(
      {
        success: true,
        stock,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        },
      },
    );
  } catch (error) {
    console.error('Failed to fetch pack stock:', error);
    return NextResponse.json(
      {
        success: false,
        stock: {},
        error: 'Failed to fetch pack stock',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}
