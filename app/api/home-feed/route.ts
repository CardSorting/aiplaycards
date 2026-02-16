import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const runtime = 'edge';

type FeedItem = {
  id: string;
  type: 'pack' | 'card' | 'listing';
  title: string;
  creator: { handle: string; avatarUrl?: string };
  metrics?: { likes?: number; views?: number; priceUsd?: number };
  ts?: string;
  href: string;
  allowlisted?: boolean;
  backgroundImage?: string;
};

function safeJson<T = any>(res: Response, fallback: T): Promise<T> {
  return res.json().catch(() => fallback as T);
}

// Generate background images for specific creators
function getCreatorBackgroundImage(handle: string): string | undefined {
  const creatorBackgrounds: Record<string, string> = {
    Resonix: '/assets/images/creator-bg-resonix.svg',
    Vulkrak: '/assets/images/creator-bg-vulkrak.svg',
    Lunaclasm: '/assets/images/creator-bg-lunaclasm.svg',
    Corollith: '/assets/images/creator-bg-corollith.svg',
    Brawddle: '/assets/images/creator-bg-brawddle.svg',
  };

  return creatorBackgrounds[handle] || undefined;
}

function normalizeCardItems(payload: any): FeedItem[] {
  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];
  // The cards endpoint may return summary objects; map conservatively
  return data.slice(0, 6).map((c: any) => {
    const id = String(
      c?.id ?? c?.cardId ?? Math.random().toString(36).slice(2),
    );
    const name = String(c?.name ?? 'Card');
    const handle = String(
      c?.username ?? c?.user?.username ?? c?.creator?.handle ?? 'creator',
    );
    const createdAt = c?.createdAt ?? c?.ts ?? undefined;
    const href = `/gallery/${encodeURIComponent(id)}`;
    return {
      id,
      type: 'card',
      title: name,
      creator: { handle },
      metrics: {
        likes: typeof c?.likes === 'number' ? c.likes : undefined,
        views: typeof c?.views === 'number' ? c.views : undefined,
      },
      ts: createdAt,
      href,
      allowlisted: true,
      backgroundImage: getCreatorBackgroundImage(handle),
    };
  });
}

function normalizeMarketplaceItems(payload: any): FeedItem[] {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  return data.slice(0, 6).map((row: any) => {
    const id = String(row?.id);
    const title = String(row?.cardName ?? row?.name ?? 'Listing');
    const handle = String(row?.sellerUsername ?? row?.username ?? 'seller');
    const createdAt = row?.createdAt ?? undefined;
    const priceUsd = row?.priceUsd ? Number(row.priceUsd) : undefined;
    const href = `/marketplace/${encodeURIComponent(id)}`;
    return {
      id,
      type: 'listing',
      title,
      creator: { handle },
      metrics: { priceUsd },
      ts: createdAt,
      href,
      allowlisted: true,
      backgroundImage: getCreatorBackgroundImage(handle),
    };
  });
}

function normalizePackListingItems(payload: any): FeedItem[] {
  const data = Array.isArray(payload?.data) ? payload.data : [];
  return data.slice(0, 6).map((row: any) => {
    const id = String(
      row?.id ?? row?.packId ?? Math.random().toString(36).slice(2),
    );
    const title = String(row?.name ?? 'Booster Pack');
    const handle = String(row?.sellerUsername ?? row?.username ?? 'creator');
    const createdAt = row?.createdAt ?? undefined;
    const href = `/marketplace/packs/${encodeURIComponent(id)}`;
    return {
      id,
      type: 'pack',
      title,
      creator: { handle },
      metrics: {
        // packsAvailable might be exposed on row; if present, keep as views to avoid new shape churn
        views:
          typeof row?.packsAvailable === 'number'
            ? row.packsAvailable
            : undefined,
        priceUsd: row?.priceUsd ? Number(row.priceUsd) : undefined,
      },
      ts: createdAt,
      href,
      allowlisted: true,
      backgroundImage: getCreatorBackgroundImage(handle),
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.origin;

    // Fetch in parallel; each endpoint already has its own cache policy
    const [cardsRes, marketRes, packRes] = await Promise.allSettled([
      fetch(`${origin}/api/cards?isPublic=true&limit=6&view=summary`, {
        cache: 'no-store',
      }),
      fetch(`${origin}/api/marketplace?limit=6&sort=new`, {
        cache: 'no-store',
      }),
      fetch(`${origin}/api/marketplace/booster-packs?limit=6`, {
        cache: 'no-store',
      }),
    ]);

    const cardsPayload =
      cardsRes.status === 'fulfilled' && cardsRes.value.ok
        ? await safeJson(cardsRes.value, { data: [] })
        : { data: [] };

    const marketPayload =
      marketRes.status === 'fulfilled' && marketRes.value.ok
        ? await safeJson(marketRes.value, { data: [] })
        : { data: [] };

    const packPayload =
      packRes.status === 'fulfilled' && packRes.value.ok
        ? await safeJson(packRes.value, { data: [] })
        : { data: [] };

    const cards = normalizeCardItems(cardsPayload);
    const listings = normalizeMarketplaceItems(marketPayload);
    const packs = normalizePackListingItems(packPayload);

    // Combine and sort by timestamp desc (fallback stable order)
    let combined: FeedItem[] = [...packs, ...cards, ...listings]
      .sort((a, b) => {
        const ta = a.ts ? Date.parse(a.ts) || 0 : 0;
        const tb = b.ts ? Date.parse(b.ts) || 0 : 0;
        return tb - ta;
      })
      .slice(0, 12);

    // If no real data, add sample creator data to showcase background images
    if (combined.length === 0) {
      const sampleCreators = [
        {
          handle: 'Resonix',
          title: 'Cyberpunk Evolution Pack',
          type: 'pack' as const,
          price: 12.99,
        },
        {
          handle: 'Vulkrak',
          title: 'Shadow Realm Collection',
          type: 'card' as const,
          price: 8.5,
        },
        {
          handle: 'Lunaclasm',
          title: 'Stellar Nebula Cards',
          type: 'card' as const,
          price: 6.75,
        },
        {
          handle: 'Corollith',
          title: 'Crystal Guardian Set',
          type: 'pack' as const,
          price: 11.25,
        },
        {
          handle: 'Brawddle',
          title: 'Adventure Quest Pack',
          type: 'card' as const,
          price: 9.99,
        },
      ];

      combined = sampleCreators.map((creator, index) => ({
        id: `sample-${index}`,
        type: creator.type,
        title: creator.title,
        creator: { handle: creator.handle },
        metrics: {
          views: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 500) + 50,
          priceUsd: creator.price,
        },
        ts: new Date(Date.now() - index * 86400000).toISOString(), // Stagger by days
        href: `/u/${creator.handle.toLowerCase()}`,
        allowlisted: true,
        backgroundImage: getCreatorBackgroundImage(creator.handle),
      }));
    }

    return NextResponse.json(
      { data: combined, total: combined.length },
      {
        headers: {
          'Cache-Control':
            'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
          Vary: 'Accept-Encoding',
        },
      },
    );
  } catch (e) {
    console.error('[home-feed] GET error', e);
    return NextResponse.json(
      { data: [], total: 0, error: 'Failed to load home feed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
