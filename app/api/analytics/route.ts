export const runtime = 'edge';
export const dynamic = 'force-dynamic';

type Payload = {
  event?: string;
  component?: string;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  meta?: Record<string, any>;
  ts?: string;
};

function sanitize(input: unknown, maxLen = 80): string | undefined {
  if (typeof input !== 'string') return undefined;
  const trimmed = input.trim().slice(0, maxLen);
  // keep letters, numbers, common punctuation, spaces, dashes/underscores
  return trimmed.replace(/[^\w\s\-.:/#@]+/g, '');
}

export async function POST(req: Request): Promise<Response> {
  try {
    const origin = req.headers.get('origin') || '';
    const host = req.headers.get('host') || '';
    // Basic same-origin check
    if (origin && !origin.includes(host)) {
      return new Response(null, { status: 403 });
    }

    const data = (await req.json().catch(() => ({}))) as Payload;

    const event = sanitize(data.event);
    if (!event) return new Response(null, { status: 400 });

    const component = sanitize(data.component);
    const label = sanitize(data.label, 160);
    const meta =
      typeof data.meta === 'object' && data.meta ? data.meta : undefined;

    // Minimal, non-blocking sink. Replace with real analytics pipeline if desired.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log('[analytics]', {
        event,
        component,
        label,
        meta,
        ts: data.ts || new Date().toISOString(),
      });
    }

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
