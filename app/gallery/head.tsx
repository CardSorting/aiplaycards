import { generateBreadcrumbStructuredData } from '../../src/utils/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default function Head() {
  const title = 'Card Gallery - Browse Custom Monster Cards | PlayMore TCG';
  const description =
    'Browse thousands of custom monster cards created by the PlayMore TCG community. Discover unique AI-generated artwork, rare cards, and amazing designs from fellow collectors.';
  const url = `${SITE_URL}/gallery`;
  const image = `${SITE_URL}/assets/images/banner.png`;

  // Generate structured data for the gallery
  const breadcrumbData = generateBreadcrumbStructuredData({
    items: [
      { name: 'Home', url: SITE_URL },
      { name: 'Gallery', url: url },
    ],
  });

  const galleryStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'PlayMore TCG Card Gallery',
    description:
      'Browse thousands of custom monster cards created by the PlayMore TCG community',
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Custom Monster Cards',
      description:
        'Collection of custom monster trading cards created by the community',
      numberOfItems: '1000+',
      itemListElement: [],
    },
  };

  const structuredData = [galleryStructuredData, breadcrumbData];

  const keywords =
    'card gallery, monster cards, custom cards, AI generated cards, digital trading cards, card collection, PlayMore TCG, browse cards';

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
        content="PlayMore TCG Card Gallery - Browse Custom Monster Cards"
      />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="PlayMore TCG Card Gallery - Browse Custom Monster Cards"
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
