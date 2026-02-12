import { marketplaceQueries } from '../../../src/db/queries';
import { dbUtils } from '../../../src/db/utils';
import {
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
  generateHowToBuyCardsData,
  generateHowToSellCardsData,
  generateHowToStructuredData,
  generateMarketplaceFAQData,
  generateMarketplaceListingStructuredData,
  generateSellerStructuredData,
} from '../../../src/utils/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';

export default async function Head(context: {
  params: Promise<{ id: string }>;
}) {
  const params = await context.params;
  const id = Number(params.id);
  let title = 'Marketplace Listing | PlayMore TCG';
  let description =
    'Custom Pokemon trading card available for purchase on PlayMore TCG marketplace.';
  let image: string | undefined = undefined;
  let listing: any = null;
  let structuredData: any = null;
  let sellerProfile: any = null;
  let sellerRating: any = null;
  let relatedListings: any[] = [];
  let marketplaceStats: any = null;

  try {
    dbUtils.validateEnv();
    if (!Number.isNaN(id)) {
      listing = await marketplaceQueries.getById(id);
      if (listing && listing.status === 'active') {
        // Enhanced title with more context
        title = `${listing.name} - $${parseFloat(
          listing.priceUsd || listing.priceCredits / 100 || '0',
        ).toFixed(2)} | Marketplace | PlayMore TCG`;

        // Enhanced description with more details
        const price = parseFloat(
          listing.priceUsd || listing.priceCredits / 100 || '0',
        ).toFixed(2);
        const type = listing.type || 'Pokemon';
        const rarity = listing.rarity || '';
        const sellerName =
          listing.sellerUsername ||
          `User ${String(listing.sellerUserId).slice(0, 8)}`;

        description = `Buy ${listing.name} - a custom ${type} trading card for $${price} on PlayMore TCG marketplace.`;
        if (rarity) {
          description += ` This ${rarity} card is available for immediate purchase.`;
        }
        description += ` Sold by ${sellerName}. Secure checkout with PayPal. Instant digital delivery to your collection.`;

        image =
          listing.imageData?.dataUrl ||
          (Array.isArray(listing.imageData?.generated) &&
            listing.imageData.generated[0]) ||
          listing.primaryImage;

        // Fetch enhanced seller data
        try {
          const sellerHandle = listing.sellerUsername || listing.sellerUserId;
          if (sellerHandle) {
            sellerProfile = await marketplaceQueries.getSellerProfile(
              sellerHandle,
            );
            sellerRating = await marketplaceQueries.getSellerRating(
              sellerHandle,
            );
          }
        } catch {}

        // Fetch related listings for SEO content
        try {
          relatedListings = await marketplaceQueries.getRelatedListings(
            listing.cardId,
            listing.id,
            4,
          );
        } catch {}

        // Fetch marketplace statistics
        try {
          marketplaceStats = await marketplaceQueries.getMarketplaceStats();
        } catch {}

        // Generate enhanced marketplace listing structured data
        const marketplaceListingData = generateMarketplaceListingStructuredData(
          {
            name: listing.name,
            description: `Custom ${
              listing.type || 'Pokemon'
            } trading card on PlayMore TCG marketplace. ${description}`,
            image: image || `${SITE_URL}/assets/images/metaImage.png`,
            listingId: String(listing.id),
            cardId: String(listing.cardId),
            type: listing.type || 'Pokemon',
            rarity: listing.rarity,
            supertype: listing.supertype,
            subtype: listing.subtype,
            illustrator: listing.illustrator,
            price: listing.priceUsd,
            priceCurrency: 'USD',
            seller: {
              name: sellerName,
              url: listing.sellerUsername
                ? `${SITE_URL}/u/${listing.sellerUsername}`
                : undefined,
              userId: String(listing.sellerUserId),
            },
            likesCount: await marketplaceQueries.getCardLikesCount(
              listing.cardId,
            ),
            createdAt: listing.createdAt,
            updatedAt: listing.updatedAt,
          },
        );

        // Generate enhanced seller structured data
        const sellerData = sellerProfile
          ? generateSellerStructuredData({
              name: sellerProfile.username || sellerName,
              url: `${SITE_URL}/u/${
                sellerProfile.username || listing.sellerUserId
              }`,
              userId: String(sellerProfile.userId || listing.sellerUserId),

              totalListings: sellerProfile.totalListings,
              totalSales: sellerProfile.totalSales,
              totalRevenue: sellerProfile.totalRevenue,
              memberSince: sellerProfile.memberSince,
              rating: sellerRating?.rating,
              reviewCount: sellerRating?.reviewCount,
            })
          : null;

        // Generate breadcrumb structured data
        const breadcrumbData = generateBreadcrumbStructuredData({
          items: [
            { name: 'Home', url: SITE_URL },
            { name: 'Marketplace', url: `${SITE_URL}/marketplace` },
            { name: listing.name, url: `${SITE_URL}/marketplace/${params.id}` },
          ],
        });

        // Generate FAQ structured data
        const faqData = generateFAQStructuredData(generateMarketplaceFAQData());

        // Generate HowTo guides
        const howToBuyData = generateHowToStructuredData(
          generateHowToBuyCardsData(),
        );
        const howToSellData = generateHowToStructuredData(
          generateHowToSellCardsData(),
        );

        // Additional structured data for better SEO
        const additionalStructuredData = {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `${listing.name} - Marketplace Listing`,
          description: description,
          url: `${SITE_URL}/marketplace/${params.id}`,
          mainEntity: marketplaceListingData,
          breadcrumb: breadcrumbData,
          ...(listing.createdAt && { datePublished: listing.createdAt }),
          ...(listing.updatedAt && { dateModified: listing.updatedAt }),
          publisher: {
            '@type': 'Organization',
            name: 'PlayMore TCG',
            url: SITE_URL,
            logo: {
              '@type': 'ImageObject',
              url: `${SITE_URL}/assets/images/logo.png`,
            },
          },
          ...(marketplaceStats && {
            additionalProperty: [
              {
                '@type': 'PropertyValue',
                name: 'Total Marketplace Listings',
                value: marketplaceStats.totalActiveListings.toString(),
              },
              {
                '@type': 'PropertyValue',
                name: 'Average Card Price',
                value: `$${
                  marketplaceStats.averagePrice?.toFixed(2) || '0.00'
                }`,
              },
            ],
          }),
        };

        // Combine all structured data
        const structuredDataArray = [
          marketplaceListingData,
          breadcrumbData,
          additionalStructuredData,
          faqData,
          howToBuyData,
          howToSellData,
        ];

        if (sellerData) {
          structuredDataArray.push(sellerData);
        }

        // Add related listings as ItemList structured data
        if (relatedListings.length > 0) {
          const relatedListingsData = {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Related ${listing.type} Cards`,
            description: `Other ${listing.type} cards available on PlayMore TCG marketplace`,
            numberOfItems: relatedListings.length,
            itemListElement: relatedListings.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: item.name,
                url: `${SITE_URL}/marketplace/${item.id}`,
                image: item.primaryImage,
                offers: {
                  '@type': 'Offer',
                  price: item.priceUsd,
                  priceCurrency: 'USD',
                  availability: 'InStock',
                },
              },
            })),
          };
          structuredDataArray.push(relatedListingsData);
        }

        structuredData = structuredDataArray;
      }
    }
  } catch {}

  const url = `${SITE_URL}/marketplace/${params.id}`;
  const ogImage = image || `${SITE_URL}/assets/images/metaImage.png`;

  // Enhanced keywords based on listing data
  const keywords = listing
    ? [
        listing.name,
        'Pokemon card',
        'custom card',
        listing.type,
        listing.rarity,
        'marketplace',
        'buy cards',
        'trading cards',
        'PlayMore TCG',
        'digital cards',
        'collectible cards',
        'card trading',
        'secure purchase',
        'PayPal payment',
        listing.supertype,
        listing.subtype,
        listing.illustrator,
        listing.sellerUsername,
        'AI generated cards',
        'custom Pokemon',
        'digital collection',
        'card marketplace',
        'buy Pokemon cards online',
        'sell Pokemon cards',
        'trading card marketplace',
      ]
        .filter(Boolean)
        .join(', ')
    : 'Pokemon cards, marketplace, buy cards, trading cards, PlayMore TCG';

  // Enhanced meta tags for better SEO
  const metaTags = [
    { name: 'title', content: title },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'author', content: 'PlayMore TCG' },
    {
      name: 'robots',
      content:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    { name: 'language', content: 'English' },
    { name: 'revisit-after', content: '7 days' },
    { name: 'distribution', content: 'global' },
    { name: 'rating', content: 'general' },
    { name: 'googlebot', content: 'index, follow' },
    { name: 'bingbot', content: 'index, follow' },
    { name: 'slurp', content: 'index, follow' },
    { name: 'msnbot', content: 'index, follow' },
    // Product-specific meta tags
    ...(listing && [
      {
        name: 'product:price:amount',
        content: listing.priceUsd || (listing.priceCredits / 100).toString(),
      },
      { name: 'product:price:currency', content: 'USD' },
      { name: 'product:availability', content: 'in stock' },
      { name: 'product:condition', content: 'new' },
      { name: 'product:category', content: 'Collectible Card' },
      { name: 'product:brand', content: 'PlayMore TCG' },
      { name: 'product:retailer_item_id', content: String(listing.id) },
      {
        name: 'product:price:standard_amount',
        content: listing.priceUsd || (listing.priceCredits / 100).toString(),
      },
      {
        name: 'product:price:min_amount',
        content: listing.priceUsd || (listing.priceCredits / 100).toString(),
      },
      {
        name: 'product:price:max_amount',
        content: listing.priceUsd || (listing.priceCredits / 100).toString(),
      },
    ]),
    // Additional SEO meta tags
    { name: 'geo.region', content: 'US' },
    { name: 'geo.placename', content: 'Worldwide' },
    { name: 'geo.position', content: '0;0' },
    { name: 'ICBM', content: '0, 0' },
    { name: 'DC.title', content: title },
    { name: 'DC.description', content: description },
    { name: 'DC.creator', content: 'PlayMore TCG' },
    {
      name: 'DC.subject',
      content: 'Pokemon Cards, Trading Cards, Marketplace',
    },
    { name: 'DC.publisher', content: 'PlayMore TCG' },
    {
      name: 'DC.date.created',
      content: listing?.createdAt || new Date().toISOString(),
    },
    {
      name: 'DC.date.modified',
      content:
        listing?.updatedAt || listing?.createdAt || new Date().toISOString(),
    },
    { name: 'DC.language', content: 'en' },
    { name: 'DC.coverage', content: 'Worldwide' },
    { name: 'DC.rights', content: 'PlayMore TCG' },
  ];

  return (
    <>
      <title>{title}</title>
      {metaTags.map((tag, index) => (
        <meta key={index} name={tag.name} content={tag.content} />
      ))}

      <link rel="canonical" href={url} />

      {/* Enhanced Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="PlayMore TCG" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content={`${
          listing?.name || 'Pokemon'
        } card - PlayMore TCG Marketplace`}
      />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="en_US" />
      <meta property="og:determiner" content="the" />

      {/* Product-specific Open Graph tags */}
      {listing && (
        <>
          <meta
            property="product:price:amount"
            content={
              listing.priceUsd || (listing.priceCredits / 100).toString()
            }
          />
          <meta property="product:price:currency" content="USD" />
          <meta property="product:availability" content="in stock" />
          <meta property="product:condition" content="new" />
          <meta property="product:category" content="Collectible Card" />
          <meta property="product:brand" content="PlayMore TCG" />
          <meta
            property="product:retailer_item_id"
            content={String(listing.id)}
          />
          <meta
            property="product:price:standard_amount"
            content={
              listing.priceUsd || (listing.priceCredits / 100).toString()
            }
          />
          <meta
            property="product:price:min_amount"
            content={
              listing.priceUsd || (listing.priceCredits / 100).toString()
            }
          />
          <meta
            property="product:price:max_amount"
            content={
              listing.priceUsd || (listing.priceCredits / 100).toString()
            }
          />
          <meta property="product:price:shipping_cost" content="0" />
          <meta property="product:price:shipping_cost_currency" content="USD" />
          <meta property="product:shipping_weight:value" content="0" />
          <meta property="product:shipping_weight:units" content="kg" />
        </>
      )}

      {/* Enhanced Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta
        name="twitter:image:alt"
        content={`${
          listing?.name || 'Pokemon'
        } card - PlayMore TCG Marketplace`}
      />
      <meta name="twitter:site" content="@playmoretcg" />
      <meta name="twitter:creator" content="@playmoretcg" />
      <meta name="twitter:label1" content="Price" />
      <meta
        name="twitter:data1"
        content={
          listing
            ? `$${parseFloat(
                listing.priceUsd || listing.priceCredits / 100 || '0',
              ).toFixed(2)}`
            : ''
        }
      />
      <meta name="twitter:label2" content="Category" />
      <meta name="twitter:data2" content="Trading Card" />
      <meta name="twitter:label3" content="Seller" />
      <meta
        name="twitter:data3"
        content={listing?.sellerUsername || 'PlayMore TCG'}
      />

      {/* Additional SEO meta tags */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta name="theme-color" content="#007AFF" />
      <meta name="color-scheme" content="light dark" />
      <meta name="msapplication-TileColor" content="#007AFF" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="PlayMore TCG" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />

      {/* PWA and favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#007AFF" />

      {/* Alternate languages */}
      <link rel="alternate" hrefLang="en-US" href={url} />
      <link rel="alternate" hrefLang="en" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="preconnect" href="https://www.paypal.com" />

      {/* Structured Data */}
      {structuredData && (
        <>
          {Array.isArray(structuredData) ? (
            structuredData.map((data, index) => (
              <script
                key={index}
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(data),
                }}
              />
            ))
          ) : (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(structuredData),
              }}
            />
          )}
        </>
      )}
    </>
  );
}
