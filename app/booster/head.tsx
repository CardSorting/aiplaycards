import {
  generateBreadcrumbStructuredData,
  generatePackStructuredData,
} from '../../src/utils/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default function Head() {
  const title = 'Open Booster Packs | PlayMore TCG';
  const description =
    'Open AI-generated Pokemon booster packs and discover unique custom cards. Each pack contains one-of-a-kind digital trading cards created by artificial intelligence.';
  const url = `${SITE_URL}/booster`;
  const image = `${SITE_URL}/assets/images/banner.png`;

  // Generate structured data for the booster page
  const packStructuredData = generatePackStructuredData({
    name: 'AI-Generated Pokemon Booster Pack',
    description:
      'Open AI-generated Pokemon booster packs and discover unique custom cards',
    image: image,
    packId: 'booster-pack',
    cardCount: 5,
    rarity: 'Mixed',
  });

  const breadcrumbData = generateBreadcrumbStructuredData({
    items: [
      { name: 'Home', url: SITE_URL },
      { name: 'Booster Packs', url: url },
    ],
  });

  const structuredData = [packStructuredData, breadcrumbData];

  const keywords =
    'booster packs, Pokemon cards, AI generated cards, digital trading cards, pack opening, custom cards, PlayMore TCG';

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="PlayMore TCG" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />

      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="PlayMore TCG" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="PlayMore TCG - AI-Generated Pokemon Booster Packs"
      />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="PlayMore TCG - AI-Generated Pokemon Booster Packs"
      />
      <meta name="twitter:site" content="@playmoretcg" />
      <meta name="twitter:creator" content="@playmoretcg" />

      {/* Structured Data */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data),
          }}
        />
      ))}
    </>
  );
}
