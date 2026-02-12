// SEO utility functions for generating structured data

export interface ProductStructuredData {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand: string;
  category: string;
  price?: string;
  priceCurrency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'New' | 'Used' | 'Refurbished';
  seller?: {
    name: string;
    url?: string;
  };
}

export interface ArticleStructuredData {
  headline: string;
  description: string;
  image: string;
  author: string;
  publisher: string;
  datePublished: string;
  dateModified?: string;
  articleSection?: string;
  articleBody?: string;
}

export interface BreadcrumbStructuredData {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export interface CardStructuredData {
  name: string;
  description: string;
  image: string;
  cardId: string;
  type: string;
  rarity?: string;
  illustrator?: string;
  creator: string;
  dateCreated: string;
}

export interface PackStructuredData {
  name: string;
  description: string;
  image: string;
  packId: string;
  cardCount: number;
  price?: string;
  priceCurrency?: string;
  rarity?: string;
}

export interface MarketplaceListingStructuredData {
  name: string;
  description: string;
  image: string;
  listingId: string;
  cardId: string;
  type: string;
  rarity?: string;
  supertype?: string;
  subtype?: string;
  illustrator?: string;
  price: string;
  priceCurrency: string;
  seller: {
    name: string;
    url?: string;
    userId?: string;
  };
  likesCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SellerStructuredData {
  name: string;
  url: string;
  userId: string;
  totalListings?: number;
  rating?: number;
  reviewCount?: number;
  totalSales?: number;
  totalRevenue?: number;
  memberSince?: string;
}

export interface ReviewStructuredData {
  name: string;
  author: string;
  reviewBody: string;
  reviewRating: number;
  datePublished: string;
  itemReviewed: string;
}

export interface FAQStructuredData {
  question: string;
  answer: string;
}

export interface HowToStructuredData {
  name: string;
  description: string;
  image: string;
  steps: Array<{ name: string; text: string; image?: string }>;
  totalTime?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tools?: string[];
  materials?: string[];
}

export interface VideoStructuredData {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
  contentUrl: string;
  embedUrl?: string;
}

export interface EventStructuredData {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  location?: {
    name: string;
    address?: string;
    url?: string;
  };
  organizer: {
    name: string;
    url?: string;
  };
  eventStatus?:
    | 'EventScheduled'
    | 'EventCancelled'
    | 'EventPostponed'
    | 'EventRescheduled';
}

/**
 * Generate Product structured data
 */
export function generateProductStructuredData(data: ProductStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: data.image,
    sku: data.sku,
    brand: {
      '@type': 'Brand',
      name: data.brand,
    },
    category: data.category,
    ...(data.price && {
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.priceCurrency || 'USD',
        availability: data.availability || 'InStock',
        condition: data.condition || 'New',
        ...(data.seller && {
          seller: {
            '@type': 'Organization',
            name: data.seller.name,
            ...(data.seller.url && { url: data.seller.url }),
          },
        }),
      },
    }),
  };
}

/**
 * Generate enhanced Marketplace Listing structured data
 */
export function generateMarketplaceListingStructuredData(
  data: MarketplaceListingStructuredData,
) {
  const baseProduct = generateProductStructuredData({
    name: data.name,
    description: data.description,
    image: data.image,
    sku: data.listingId,
    brand: 'PlayMore TCG',
    category: 'Collectible Card',
    price: data.price,
    priceCurrency: data.priceCurrency,
    availability: 'InStock',
    condition: 'New',
    seller: data.seller,
  });

  // Add additional properties specific to marketplace listings
  const additionalProperties = [
    {
      '@type': 'PropertyValue',
      name: 'Card Type',
      value: data.type,
    },
    {
      '@type': 'PropertyValue',
      name: 'Card ID',
      value: data.cardId,
    },
    {
      '@type': 'PropertyValue',
      name: 'Listing ID',
      value: data.listingId,
    },
  ];

  if (data.rarity) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Rarity',
      value: data.rarity,
    });
  }

  if (data.supertype) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Supertype',
      value: data.supertype,
    });
  }

  if (data.subtype) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Subtype',
      value: data.subtype,
    });
  }

  if (data.illustrator) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Illustrator',
      value: data.illustrator,
    });
  }

  if (data.likesCount !== undefined) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Likes',
      value: data.likesCount.toString(),
    });
  }

  return {
    ...baseProduct,
    additionalProperty: additionalProperties,
    ...(data.createdAt && { dateCreated: data.createdAt }),
    ...(data.updatedAt && { dateModified: data.updatedAt }),
  };
}

/**
 * Generate Seller structured data
 */
export function generateSellerStructuredData(data: SellerStructuredData) {
  const sellerData: any = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: data.name,
    url: data.url,
    identifier: data.userId,
  };

  if (data.totalListings !== undefined || data.totalSales !== undefined) {
    sellerData.hasOccupation = {
      '@type': 'Occupation',
      name: 'Trading Card Seller',
      occupationLocation: {
        '@type': 'Place',
        name: 'PlayMore TCG Marketplace',
      },
    };
  }

  if (data.rating !== undefined && data.reviewCount !== undefined) {
    sellerData.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: data.rating,
      reviewCount: data.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (data.totalSales !== undefined) {
    sellerData.additionalProperty = [
      {
        '@type': 'PropertyValue',
        name: 'Total Sales',
        value: data.totalSales.toString(),
      },
    ];
  }

  if (data.totalRevenue !== undefined) {
    sellerData.additionalProperty = sellerData.additionalProperty || [];
    sellerData.additionalProperty.push({
      '@type': 'PropertyValue',
      name: 'Total Revenue',
      value: data.totalRevenue.toString(),
    });
  }

  if (data.memberSince) {
    sellerData.memberOf = {
      '@type': 'Organization',
      name: 'PlayMore TCG',
      memberSince: data.memberSince,
    };
  }

  return sellerData;
}

/**
 * Generate Review structured data
 */
export function generateReviewStructuredData(data: ReviewStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    name: data.name,
    author: {
      '@type': 'Person',
      name: data.author,
    },
    reviewBody: data.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: data.reviewRating,
      bestRating: 5,
      worstRating: 1,
    },
    datePublished: data.datePublished,
    itemReviewed: {
      '@type': 'Product',
      name: data.itemReviewed,
    },
  };
}

/**
 * Generate FAQ structured data
 */
export function generateFAQStructuredData(faqs: FAQStructuredData[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate HowTo structured data
 */
export function generateHowToStructuredData(data: HowToStructuredData) {
  const howToData: any = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    image: data.image,
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };

  if (data.totalTime) {
    howToData.totalTime = data.totalTime;
  }

  if (data.difficulty) {
    howToData.difficulty = data.difficulty;
  }

  if (data.tools && data.tools.length > 0) {
    howToData.tool = data.tools.map(tool => ({
      '@type': 'HowToTool',
      name: tool,
    }));
  }

  if (data.materials && data.materials.length > 0) {
    howToData.material = data.materials.map(material => ({
      '@type': 'HowToSupply',
      name: material,
    }));
  }

  return howToData;
}

/**
 * Generate Video structured data
 */
export function generateVideoStructuredData(data: VideoStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: data.name,
    description: data.description,
    thumbnailUrl: data.thumbnailUrl,
    uploadDate: data.uploadDate,
    duration: data.duration,
    contentUrl: data.contentUrl,
    ...(data.embedUrl && { embedUrl: data.embedUrl }),
    publisher: {
      '@type': 'Organization',
      name: 'PlayMore TCG',
      logo: {
        '@type': 'ImageObject',
        url: 'https://playmoretcg.com/assets/images/logo.png',
      },
    },
  };
}

/**
 * Generate Event structured data
 */
export function generateEventStructuredData(data: EventStructuredData) {
  const eventData: any = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: data.name,
    description: data.description,
    startDate: data.startDate,
    organizer: {
      '@type': 'Organization',
      name: data.organizer.name,
      ...(data.organizer.url && { url: data.organizer.url }),
    },
  };

  if (data.endDate) {
    eventData.endDate = data.endDate;
  }

  if (data.location) {
    eventData.location = {
      '@type': 'Place',
      name: data.location.name,
      ...(data.location.address && { address: data.location.address }),
      ...(data.location.url && { url: data.location.url }),
    };
  }

  if (data.eventStatus) {
    eventData.eventStatus = data.eventStatus;
  }

  return eventData;
}

/**
 * Generate Article structured data
 */
export function generateArticleStructuredData(data: ArticleStructuredData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.headline,
    description: data.description,
    image: data.image,
    author: {
      '@type': 'Person',
      name: data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: data.publisher,
      logo: {
        '@type': 'ImageObject',
        url: 'https://playmoretcg.com/assets/images/logo.png',
      },
    },
    datePublished: data.datePublished,
    ...(data.dateModified && { dateModified: data.dateModified }),
    ...(data.articleSection && { articleSection: data.articleSection }),
    ...(data.articleBody && { articleBody: data.articleBody }),
  };
}

/**
 * Generate Breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(
  data: BreadcrumbStructuredData,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Card structured data
 */
export function generateCardStructuredData(data: CardStructuredData) {
  const additionalProperties = [
    {
      '@type': 'PropertyValue',
      name: 'Card Type',
      value: data.type,
    },
    {
      '@type': 'PropertyValue',
      name: 'Card ID',
      value: data.cardId,
    },
  ];

  if (data.rarity) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Rarity',
      value: data.rarity,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: data.name,
    description: data.description,
    image: data.image,
    identifier: data.cardId,
    creator: {
      '@type': 'Person',
      name: data.creator,
    },
    dateCreated: data.dateCreated,
    ...(data.illustrator && { illustrator: data.illustrator }),
    additionalProperty: additionalProperties,
  };
}

/**
 * Generate Pack structured data
 */
export function generatePackStructuredData(data: PackStructuredData) {
  const additionalProperties = [
    {
      '@type': 'PropertyValue',
      name: 'Card Count',
      value: data.cardCount.toString(),
    },
    {
      '@type': 'PropertyValue',
      name: 'Pack ID',
      value: data.packId,
    },
  ];

  if (data.rarity) {
    additionalProperties.push({
      '@type': 'PropertyValue',
      name: 'Rarity',
      value: data.rarity,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: data.name,
    description: data.description,
    image: data.image,
    sku: data.packId,
    brand: {
      '@type': 'Brand',
      name: 'PlayMore TCG',
    },
    category: 'Trading Card Pack',
    ...(data.price && {
      offers: {
        '@type': 'Offer',
        price: data.price,
        priceCurrency: data.priceCurrency || 'USD',
        availability: 'InStock',
      },
    }),
    additionalProperty: additionalProperties,
  };
}

/**
 * Generate LocalBusiness structured data
 */
export function generateLocalBusinessStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'PlayMore TCG',
    description:
      'AI-powered Pokemon card creator and digital trading card platform',
    url: 'https://playmoretcg.com',
    logo: 'https://playmoretcg.com/assets/images/logo.png',
    sameAs: [
      'https://twitter.com/playmoretcg',
      'https://discord.gg/playmoretcg',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@playmoretcg.com',
      availableLanguage: 'English',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Worldwide',
    },
    serviceType: 'Digital Trading Card Platform',
  };
}

/**
 * Generate WebSite structured data with search functionality
 */
export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PlayMore TCG',
    url: 'https://playmoretcg.com',
    description:
      'Create your own custom Pokémon cards in the modern Sword and Shield format, including Pokémon-V, V-Max and Full Art Trainers!',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://playmoretcg.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate enhanced Marketplace structured data
 */
export function generateMarketplaceStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'PlayMore TCG Marketplace',
    description:
      'Browse and buy custom Pokemon trading cards from the PlayMore TCG marketplace',
    url: 'https://playmoretcg.com/marketplace',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Pokemon Trading Cards',
      description:
        'Collection of custom Pokemon trading cards available for purchase',
      numberOfItems: '100+',
      itemListElement: [],
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://playmoretcg.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Marketplace',
          item: 'https://playmoretcg.com/marketplace',
        },
      ],
    },
  };
}

/**
 * Generate comprehensive FAQ data for marketplace
 */
export function generateMarketplaceFAQData() {
  return [
    {
      question: 'How do I buy cards on the PlayMore TCG marketplace?',
      answer:
        "To buy cards, simply browse the marketplace, click on a card you like, and use the 'Buy Now' button. You can pay securely with PayPal and the card will be instantly delivered to your collection.",
    },
    {
      question: 'How do I sell my custom Pokemon cards?',
      answer:
        "To sell cards, go to your collection, select a card you want to sell, and click 'List for Sale'. Set your price in USD and your card will appear in the marketplace for other users to purchase.",
    },
    {
      question: 'Are the cards on the marketplace official Pokemon cards?',
      answer:
        'No, these are custom AI-generated Pokemon cards created by users on the PlayMore TCG platform. Each card is unique and created using our advanced AI technology.',
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We currently accept PayPal for all marketplace transactions. Payments are processed securely and instantly.',
    },
    {
      question: 'How do I know if a seller is trustworthy?',
      answer:
        'All sellers on our platform are verified users. You can view their profile, see their sales history, and check their ratings before making a purchase.',
    },
    {
      question: 'Can I trade cards instead of buying them?',
      answer:
        "Currently, the marketplace only supports buying and selling with real money. We're working on implementing a card trading system for the future.",
    },
  ];
}

/**
 * Generate HowTo guide for buying cards
 */
export function generateHowToBuyCardsData(): HowToStructuredData {
  return {
    name: 'How to Buy Pokemon Cards on PlayMore TCG Marketplace',
    description:
      'Learn how to purchase custom Pokemon cards from the PlayMore TCG marketplace with our step-by-step guide.',
    image: 'https://playmoretcg.com/assets/images/marketplace-guide.png',
    totalTime: 'PT5M',
    difficulty: 'Easy' as const,
    steps: [
      {
        name: 'Browse the Marketplace',
        text: 'Visit the marketplace page and browse through available custom Pokemon cards. Use filters to find specific types, rarities, or price ranges.',
      },
      {
        name: 'Select a Card',
        text: 'Click on any card that interests you to view its details, including price, seller information, and card specifications.',
      },
      {
        name: 'Review Card Details',
        text: "Examine the card's image, type, rarity, and other details. Check the seller's profile and ratings if available.",
      },
      {
        name: 'Click Buy Now',
        text: "If you're satisfied with the card and price, click the 'Buy Now' button to proceed to checkout.",
      },
      {
        name: 'Complete Payment',
        text: 'Pay securely with PayPal. The transaction is processed instantly and securely.',
      },
      {
        name: 'Receive Your Card',
        text: 'The card is immediately transferred to your collection. You can view it in your cards section right away.',
      },
    ],
    tools: [
      'Computer or mobile device',
      'PayPal account',
      'PlayMore TCG account',
    ],
    materials: ['Internet connection', 'Payment method'],
  };
}

/**
 * Generate HowTo guide for selling cards
 */
export function generateHowToSellCardsData(): HowToStructuredData {
  return {
    name: 'How to Sell Your Custom Pokemon Cards on PlayMore TCG',
    description:
      'Learn how to list and sell your custom Pokemon cards on the PlayMore TCG marketplace.',
    image: 'https://playmoretcg.com/assets/images/selling-guide.png',
    totalTime: 'PT10M',
    difficulty: 'Easy' as const,
    steps: [
      {
        name: 'Access Your Collection',
        text: 'Log into your PlayMore TCG account and navigate to your card collection.',
      },
      {
        name: 'Select a Card to Sell',
        text: "Choose a card from your collection that you want to sell. Make sure it's a card you're willing to part with.",
      },
      {
        name: 'Click List for Sale',
        text: "Find the 'List for Sale' option on the card's detail page and click it to start the listing process.",
      },
      {
        name: 'Set Your Price',
        text: "Enter the price you want to sell the card for in USD. Consider the card's rarity, type, and market demand.",
      },
      {
        name: 'Review and Confirm',
        text: 'Double-check all the listing details including price, card information, and terms before confirming.',
      },
      {
        name: 'List Your Card',
        text: "Click 'List Card' to publish your listing. Your card will now appear in the marketplace for buyers to see.",
      },
      {
        name: 'Monitor Your Sale',
        text: "Keep track of your listing through your marketplace dashboard. You'll be notified when someone purchases your card.",
      },
    ],
    tools: ['Computer or mobile device', 'PlayMore TCG account'],
    materials: [
      'Custom Pokemon cards in your collection',
      'Internet connection',
    ],
  };
}
