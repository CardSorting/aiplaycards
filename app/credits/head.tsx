import { generateBreadcrumbStructuredData } from '../../src/utils/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default function Head() {
  const title = 'Buy Credits - PlayMore TCG';
  const description =
    'Purchase credits to open booster packs, create custom Pokemon cards, and unlock premium features on PlayMore TCG. Secure payment with PayPal.';
  const url = `${SITE_URL}/credits`;
  const image = `${SITE_URL}/assets/images/banner.png`;

  // Generate structured data for the credits page
  const breadcrumbData = generateBreadcrumbStructuredData({
    items: [
      { name: 'Home', url: SITE_URL },
      { name: 'Credits', url: url },
    ],
  });

  const creditsStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PlayMore TCG Credits',
    description:
      'Purchase credits to unlock features and content on PlayMore TCG',
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      name: 'Credit Packages',
      description: 'Available credit packages for purchase',
      numberOfItems: '4',
      itemListElement: [
        {
          '@type': 'Product',
          name: 'Starter Pack',
          description: '100 credits for new users',
          offers: {
            '@type': 'Offer',
            price: '4.99',
            priceCurrency: 'USD',
            availability: 'InStock',
          },
        },
        {
          '@type': 'Product',
          name: 'Collector Pack',
          description: '500 credits for serious collectors',
          offers: {
            '@type': 'Offer',
            price: '19.99',
            priceCurrency: 'USD',
            availability: 'InStock',
          },
        },
        {
          '@type': 'Product',
          name: 'Premium Pack',
          description: '1000 credits for power users',
          offers: {
            '@type': 'Offer',
            price: '34.99',
            priceCurrency: 'USD',
            availability: 'InStock',
          },
        },
        {
          '@type': 'Product',
          name: 'Ultimate Pack',
          description: '2500 credits for ultimate collectors',
          offers: {
            '@type': 'Offer',
            price: '79.99',
            priceCurrency: 'USD',
            availability: 'InStock',
          },
        },
      ],
    },
  };

  const structuredData = [creditsStructuredData, breadcrumbData];

  const keywords =
    'buy credits, PlayMore TCG credits, purchase credits, booster packs, card creator, premium features, PayPal payment';

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
        content="PlayMore TCG Credits - Purchase Credits"
      />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="PlayMore TCG Credits - Purchase Credits"
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
