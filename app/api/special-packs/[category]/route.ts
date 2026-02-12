import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { SpecialPackService } from '../../../../src/features/special-packs/service';
import { urlFriendlySlug } from '../../../../src/routes';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> },
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
    const categoryParam = resolvedParams.category;

    // Handle special case for uncategorized packs
    let categoryId: number | undefined;
    if (categoryParam === 'uncategorized' || categoryParam === 'special') {
      categoryId = undefined; // This will fetch uncategorized packs
    } else if (!isNaN(parseInt(categoryParam))) {
      categoryId = parseInt(categoryParam);
    } else {
      // Try to find category by name (slug-like)
      const allCategories = await SpecialPackService.getAllActiveCategories();
      const matchingCategory = allCategories.find(
        cat => urlFriendlySlug(cat.name) === categoryParam.toLowerCase(),
      );

      if (matchingCategory) {
        categoryId = matchingCategory.id;
      } else {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 },
        );
      }
    }

    const packs = await SpecialPackService.getPacksByCategory(
      session.user.id,
      categoryId,
    );

    return NextResponse.json({
      packs,
      category: categoryParam,
      message:
        packs.length === 0
          ? 'No PlayMore packs available in this category'
          : undefined,
    });
  } catch (error) {
    console.error('[PlayMore Packs] GET category packs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PlayMore packs' },
      { status: 500 },
    );
  }
}
