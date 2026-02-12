#!/usr/bin/env node

/**
 * PlayMore TCG - Comprehensive Sitemap Generator
 * Generates multiple specialized sitemaps for better SEO
 */

const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const SITE_URL = 'https://playmoretcg.com';
const OUTPUT_DIR = path.join(__dirname, '../public');

// Helper function to create XML sitemap
function createSitemapXML(urls, filename) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" 
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" 
        xmlns:xhtml="http://www.w3.org/1999/xhtml" 
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" 
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" 
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls
  .map(
    url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
    ${
      url.image
        ? `<image:image>
      <image:loc>${url.image}</image:loc>
      <image:title>${url.imageTitle || ''}</image:title>
    </image:image>`
        : ''
    }
  </url>`,
  )
  .join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), xml);
  console.log(`✅ Generated ${filename} with ${urls.length} URLs`);
}

// Helper function to create sitemap index
function createSitemapIndex(sitemaps, filename) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps
  .map(
    sitemap => `  <sitemap>
    <loc>${SITE_URL}/${sitemap.filename}</loc>
    <lastmod>${sitemap.lastmod}</lastmod>
  </sitemap>`,
  )
  .join('\n')}
</sitemapindex>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, filename), xml);
  console.log(`✅ Generated ${filename} with ${sitemaps.length} sitemaps`);
}

// Main sitemap URLs
const mainUrls = [
  {
    loc: SITE_URL,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'daily',
    priority: '1.0',
  },
  {
    loc: `${SITE_URL}/booster`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    loc: `${SITE_URL}/creator`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    loc: `${SITE_URL}/gallery`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    loc: `${SITE_URL}/marketplace`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    loc: `${SITE_URL}/credits`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    loc: `${SITE_URL}/privacy`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'monthly',
    priority: '0.3',
  },
  {
    loc: `${SITE_URL}/terms`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'monthly',
    priority: '0.3',
  },
];

// Gallery sitemap URLs (example - would be populated from database)
const galleryUrls = [
  {
    loc: `${SITE_URL}/gallery/1`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'weekly',
    priority: '0.7',
    image: `${SITE_URL}/assets/images/card1.png`,
    imageTitle: 'Custom Pokemon Card 1',
  },
  {
    loc: `${SITE_URL}/gallery/2`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'weekly',
    priority: '0.7',
    image: `${SITE_URL}/assets/images/card2.png`,
    imageTitle: 'Custom Pokemon Card 2',
  },
  // Would be populated from database with actual card data
];

// Marketplace sitemap URLs (example - would be populated from database)
const marketplaceUrls = [
  {
    loc: `${SITE_URL}/marketplace/1`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'daily',
    priority: '0.8',
    image: `${SITE_URL}/assets/images/listing1.png`,
    imageTitle: 'Pokemon Card for Sale 1',
  },
  {
    loc: `${SITE_URL}/marketplace/2`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'daily',
    priority: '0.8',
    image: `${SITE_URL}/assets/images/listing2.png`,
    imageTitle: 'Pokemon Card for Sale 2',
  },
  // Would be populated from database with actual listing data
];

// User profiles sitemap URLs (example - would be populated from database)
const userUrls = [
  {
    loc: `${SITE_URL}/u/user1`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'weekly',
    priority: '0.6',
  },
  {
    loc: `${SITE_URL}/u/user2`,
    lastmod: format(new Date(), 'yyyy-MM-dd'),
    changefreq: 'weekly',
    priority: '0.6',
  },
  // Would be populated from database with actual user data
];

// Generate individual sitemaps
createSitemapXML(mainUrls, 'sitemap-main.xml');
createSitemapXML(galleryUrls, 'sitemap-gallery.xml');
createSitemapXML(marketplaceUrls, 'sitemap-marketplace.xml');
createSitemapXML(userUrls, 'sitemap-users.xml');

// Create sitemap index
const sitemapIndex = [
  {
    filename: 'sitemap-main.xml',
    lastmod: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    filename: 'sitemap-gallery.xml',
    lastmod: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    filename: 'sitemap-marketplace.xml',
    lastmod: format(new Date(), 'yyyy-MM-dd'),
  },
  {
    filename: 'sitemap-users.xml',
    lastmod: format(new Date(), 'yyyy-MM-dd'),
  },
];

createSitemapIndex(sitemapIndex, 'sitemap.xml');

console.log('\n🎉 All sitemaps generated successfully!');
console.log('\nGenerated files:');
console.log('- sitemap.xml (index)');
console.log('- sitemap-main.xml');
console.log('- sitemap-gallery.xml');
console.log('- sitemap-marketplace.xml');
console.log('- sitemap-users.xml');

// Update robots.txt with new sitemap references
const robotsTxtPath = path.join(OUTPUT_DIR, 'robots.txt');
let robotsContent = fs.readFileSync(robotsTxtPath, 'utf8');

// Remove old sitemap references
robotsContent = robotsContent.replace(/Sitemap:.*\n/g, '');

// Add new sitemap references
const sitemapReferences = `
# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml
Sitemap: ${SITE_URL}/sitemap-main.xml
Sitemap: ${SITE_URL}/sitemap-gallery.xml
Sitemap: ${SITE_URL}/sitemap-marketplace.xml
Sitemap: ${SITE_URL}/sitemap-users.xml
`;

robotsContent += sitemapReferences;
fs.writeFileSync(robotsTxtPath, robotsContent);
console.log('\n✅ Updated robots.txt with new sitemap references');
