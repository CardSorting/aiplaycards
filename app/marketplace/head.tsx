import { generateBreadcrumbStructuredData } from '../../src/utils/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default function Head() {
  const title = 'Marketplace - Buy & Sell Pokemon Cards | PlayMore TCG';
  const description =
    'Browse and buy custom Pokemon trading cards from the PlayMore TCG marketplace. Discover unique AI-generated cards, trade with other collectors, and build your digital collection.';
  const url = `${SITE_URL}/marketplace`;
  const image = `${SITE_URL}/assets/images/banner.png`;

  // Generate structured data for the marketplace
  const breadcrumbData = generateBreadcrumbStructuredData({
    items: [
      { name: 'Home', url: SITE_URL },
      { name: 'Marketplace', url: url },
    ],
  });

  const marketplaceStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PlayMore TCG Marketplace',
    description:
      'Browse and buy custom Pokemon trading cards from the PlayMore TCG marketplace',
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Pokemon Trading Cards',
      description:
        'Collection of custom Pokemon trading cards available for purchase',
      numberOfItems: '100+',
      itemListElement: [],
    },
  };

  const structuredData = [marketplaceStructuredData, breadcrumbData];

  const keywords =
    'marketplace, buy Pokemon cards, sell Pokemon cards, trading cards, custom cards, digital cards, PlayMore TCG, card trading';

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
        content="PlayMore TCG Marketplace - Buy & Sell Pokemon Cards"
      />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="PlayMore TCG Marketplace - Buy & Sell Pokemon Cards"
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
