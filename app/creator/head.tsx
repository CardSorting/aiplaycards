import {
  generateBreadcrumbStructuredData,
  generateHowToStructuredData,
} from '../../src/utils/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default function Head() {
  const title = 'Create Custom Monster Cards | PlayMore TCG';
  const description =
    'Create your own custom monster cards with our AI-powered card creator. Design unique monster cards, V-Max, and Full Art Trainer cards in the modern format.';
  const url = `${SITE_URL}/creator`;
  const image = `${SITE_URL}/assets/images/banner.png`;

  // Generate structured data for the creator page
  const howToData = generateHowToStructuredData({
    name: 'Create Custom Monster Cards',
    description:
      "Learn how to create custom monster cards using PlayMore TCG's AI-powered card creator",
    image: image,
    totalTime: 'PT10M',
    difficulty: 'Easy',
    steps: [
      {
        name: 'Choose Card Type',
        text: 'Select from Monster, Trainer, or Energy card types',
        image: `${SITE_URL}/assets/images/creator-step1.png`,
      },
      {
        name: 'Design Your Card',
        text: 'Customize the card name, description, stats, and artwork',
        image: `${SITE_URL}/assets/images/creator-step2.png`,
      },
      {
        name: 'Generate Artwork',
        text: 'Use AI to generate unique artwork for your card',
        image: `${SITE_URL}/assets/images/creator-step3.png`,
      },
      {
        name: 'Save and Share',
        text: 'Save your card to your collection and share with the community',
        image: `${SITE_URL}/assets/images/creator-step4.png`,
      },
    ],
  });

  const breadcrumbData = generateBreadcrumbStructuredData({
    items: [
      { name: 'Home', url: SITE_URL },
      { name: 'Creator', url: url },
    ],
  });

  const structuredData = [howToData, breadcrumbData];

  const keywords =
    'create monster cards, custom card maker, AI card generator, monster card creator, card design tool, PlayMore TCG, custom trading cards';

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
        content="PlayMore TCG Card Creator - Create Custom Monster Cards"
      />
      <meta property="og:locale" content="en_US" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="PlayMore TCG Card Creator - Create Custom Monster Cards"
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
