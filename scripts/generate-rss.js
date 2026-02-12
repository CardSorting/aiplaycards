#!/usr/bin/env node

/**
 * PlayMore TCG - RSS Feed Generator
 * Generates RSS feeds for different content types
 */

const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const SITE_URL = 'https://playmoretcg.com';
const OUTPUT_DIR = path.join(__dirname, '../public');

// Helper function to create RSS feed
function createRSSFeed(items, filename, title, description, link) {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:image="http://purl.org/rss/1.0/modules/image/">
  <channel>
    <title>${title}</title>
    <link>${link}</link>
    <description>${description}</description>
    <language>en-US</language>
    <lastBuildDate>${format(
      new Date(),
      'EEE, dd MMM yyyy HH:mm:ss',
    )} GMT</lastBuildDate>
    <atom:link href="${SITE_URL}/${filename}" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/assets/images/logo.png</url>
      <title>${title}</title>
      <link>${link}</link>
    </image>
${items
  .map(
    item => `    <item>
      <title>${item.title}</title>
      <link>${item.link}</link>
      <guid>${item.guid || item.link}</guid>
      <pubDate>${format(
        new Date(item.pubDate),
        'EEE, dd MMM yyyy HH:mm:ss',
      )} GMT</pubDate>
      <description><![CDATA[${item.description}]]></description>
      ${
        item.image
          ? `<image:image>
        <image:url>${item.image}</image:url>
        <image:title>${item.title}</image:title>
      </image:image>`
          : ''
      }
      ${item.author ? `<dc:creator>${item.author}</dc:creator>` : ''}
      ${item.category ? `<category>${item.category}</category>` : ''}
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), rss);
  console.log(`✅ Generated ${filename} with ${items.length} items`);
}

// Latest cards RSS feed
const latestCards = [
  {
    title: 'Amazing Fire Pokemon Card',
    link: `${SITE_URL}/gallery/1`,
    guid: `${SITE_URL}/gallery/1`,
    pubDate: new Date(),
    description:
      'Check out this amazing custom Fire-type Pokemon card created by the community!',
    image: `${SITE_URL}/assets/images/card1.png`,
    author: 'PokemonCreator123',
    category: 'Fire Pokemon',
  },
  {
    title: 'Rare Water Pokemon Card',
    link: `${SITE_URL}/gallery/2`,
    guid: `${SITE_URL}/gallery/2`,
    pubDate: new Date(Date.now() - 86400000), // 1 day ago
    description:
      'A rare Water-type Pokemon card with stunning artwork and powerful abilities.',
    image: `${SITE_URL}/assets/images/card2.png`,
    author: 'WaterMaster',
    category: 'Water Pokemon',
  },
  // Would be populated from database with actual card data
];

// Latest marketplace listings RSS feed
const latestListings = [
  {
    title: 'Legendary Pokemon Card for Sale',
    link: `${SITE_URL}/marketplace/1`,
    guid: `${SITE_URL}/marketplace/1`,
    pubDate: new Date(),
    description:
      "Rare Legendary Pokemon card available for purchase. Don't miss this opportunity!",
    image: `${SITE_URL}/assets/images/listing1.png`,
    author: 'CardTrader',
    category: 'Legendary Pokemon',
  },
  {
    title: 'Vintage Pokemon Card Collection',
    link: `${SITE_URL}/marketplace/2`,
    guid: `${SITE_URL}/marketplace/2`,
    pubDate: new Date(Date.now() - 172800000), // 2 days ago
    description:
      'Complete vintage Pokemon card collection available for serious collectors.',
    image: `${SITE_URL}/assets/images/listing2.png`,
    author: 'VintageCollector',
    category: 'Vintage Cards',
  },
  // Would be populated from database with actual listing data
];

// Site news and updates RSS feed
const siteNews = [
  {
    title: 'New AI Card Generator Features Released',
    link: `${SITE_URL}/news/ai-features`,
    guid: `${SITE_URL}/news/ai-features`,
    pubDate: new Date(),
    description:
      "We've released exciting new AI-powered features for creating even more amazing Pokemon cards!",
    author: 'PlayMore TCG Team',
    category: 'Updates',
  },
  {
    title: 'Community Spotlight: Best Cards of the Month',
    link: `${SITE_URL}/news/community-spotlight`,
    guid: `${SITE_URL}/news/community-spotlight`,
    pubDate: new Date(Date.now() - 259200000), // 3 days ago
    description:
      'Check out the most amazing Pokemon cards created by our community this month!',
    author: 'PlayMore TCG Team',
    category: 'Community',
  },
  {
    title: 'New Booster Pack Series Available',
    link: `${SITE_URL}/news/new-booster-series`,
    guid: `${SITE_URL}/news/new-booster-series`,
    pubDate: new Date(Date.now() - 604800000), // 1 week ago
    description:
      'Introducing our latest booster pack series with exclusive Pokemon cards!',
    author: 'PlayMore TCG Team',
    category: 'Products',
  },
];

// Generate RSS feeds
createRSSFeed(
  latestCards,
  'rss-latest-cards.xml',
  'PlayMore TCG - Latest Cards',
  'Latest custom Pokemon cards created by the PlayMore TCG community',
  `${SITE_URL}/gallery`,
);

createRSSFeed(
  latestListings,
  'rss-marketplace.xml',
  'PlayMore TCG - Latest Marketplace Listings',
  'Latest Pokemon cards available for purchase in the PlayMore TCG marketplace',
  `${SITE_URL}/marketplace`,
);

createRSSFeed(
  siteNews,
  'rss-news.xml',
  'PlayMore TCG - News and Updates',
  'Latest news, updates, and announcements from PlayMore TCG',
  `${SITE_URL}/news`,
);

console.log('\n🎉 All RSS feeds generated successfully!');
console.log('\nGenerated files:');
console.log('- rss-latest-cards.xml');
console.log('- rss-marketplace.xml');
console.log('- rss-news.xml');

// Create RSS feed index
const rssIndex = `<?xml version="1.0" encoding="UTF-8"?>
<rssindex>
  <title>PlayMore TCG - RSS Feeds</title>
  <description>Available RSS feeds for PlayMore TCG content</description>
  <feeds>
    <feed>
      <title>Latest Cards</title>
      <description>Latest custom Pokemon cards created by the community</description>
      <link>${SITE_URL}/rss-latest-cards.xml</link>
    </feed>
    <feed>
      <title>Marketplace Listings</title>
      <description>Latest Pokemon cards available for purchase</description>
      <link>${SITE_URL}/rss-marketplace.xml</link>
    </feed>
    <feed>
      <title>News and Updates</title>
      <description>Latest news, updates, and announcements</description>
      <link>${SITE_URL}/rss-news.xml</link>
    </feed>
  </feeds>
</rssindex>`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'rss-index.xml'), rssIndex);
console.log('- rss-index.xml');

console.log('\n✅ RSS feed generation complete!');
