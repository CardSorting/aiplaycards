const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default async function Head(context: {
  params: Promise<{ id: string }>;
}) {
  const params = await context.params;
  const url = `${SITE_URL}/embed/card/${params.id}`;
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta httpEquiv="X-Frame-Options" content="ALLOWALL" />
      <meta httpEquiv="Content-Security-Policy" content="frame-ancestors *" />
      <link rel="canonical" href={url} />
    </>
  );
}
