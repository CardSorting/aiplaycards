import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../auth';
import { db } from '../../../../../src/db';
import { specialAnimationTemplates } from '../../../../../src/db/schema/special-animation-queue';
import { and, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

interface TemplateResponse {
  success: true;
  templates: Array<{
    id: number;
    name: string;
    description?: string;
    animationType: string;
    duration: number;
    creditCost: number;
    rarityFilter?: string;
    isPremium: boolean;
    animationConfig: any;
  }>;
}

interface ErrorResponse {
  success: false;
  error: string;
  errorCode: string;
  userMessage: string;
}

/**
 * Get available animation templates
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          errorCode: 'UNAUTHORIZED',
          userMessage: 'Please sign in to view animation templates.',
        } as ErrorResponse,
        { status: 401 },
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const animationType = searchParams.get('type');
    const rarity = searchParams.get('rarity');
    const includePremium = searchParams.get('includePremium') === 'true';

    // Build where conditions
    const whereConditions = [eq(specialAnimationTemplates.isActive, true)];

    if (animationType) {
      whereConditions.push(
        eq(specialAnimationTemplates.animationType, animationType),
      );
    }

    if (rarity) {
      // Add rarity filter - can be null for universal templates or match specific rarity
      whereConditions
        .push
        // Template is universal (no rarity filter) OR matches the specified rarity
        // Note: This would need proper null handling in a real implementation
        ();
    }

    if (!includePremium) {
      whereConditions.push(eq(specialAnimationTemplates.isPremium, false));
    }

    // Fetch templates
    const templates = await db
      .select({
        id: specialAnimationTemplates.id,
        name: specialAnimationTemplates.name,
        description: specialAnimationTemplates.description,
        animationType: specialAnimationTemplates.animationType,
        duration: specialAnimationTemplates.duration,
        creditCost: specialAnimationTemplates.creditCost,
        rarityFilter: specialAnimationTemplates.rarityFilter,
        isPremium: specialAnimationTemplates.isPremium,
        animationConfig: specialAnimationTemplates.animationConfig,
      })
      .from(specialAnimationTemplates)
      .where(and(...whereConditions))
      .orderBy(
        specialAnimationTemplates.creditCost,
        specialAnimationTemplates.name,
      );

    // Parse animation configs
    const parsedTemplates = templates.map(template => {
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(template.animationConfig);
      } catch (error) {
        console.error(
          `[Animation Templates API] Failed to parse config for template ${template.id}:`,
          error,
        );
        parsedConfig = {};
      }

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        animationType: template.animationType,
        duration: template.duration,
        creditCost: template.creditCost,
        rarityFilter: template.rarityFilter,
        isPremium: template.isPremium,
        animationConfig: parsedConfig,
      };
    });

    return NextResponse.json({
      success: true,
      templates: parsedTemplates,
    } as TemplateResponse);
  } catch (error) {
    console.error('[Animation Templates API] GET error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userId: (await auth())?.user?.id,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        errorCode: 'SERVER_ERROR',
        userMessage: 'Unable to load animation templates at this time.',
      } as ErrorResponse,
      { status: 500 },
    );
  }
}
