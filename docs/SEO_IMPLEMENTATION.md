# PlayMore TCG - SEO Implementation Guide

## Overview

This document outlines the comprehensive SEO implementation for PlayMore TCG, including structured data, meta tags, robots.txt, sitemaps, and traditional industry standard methods.

## Table of Contents

1. [Structured Data Implementation](#structured-data-implementation)
2. [Meta Tags and Head Components](#meta-tags-and-head-components)
3. [Robots.txt Configuration](#robotstxt-configuration)
4. [Sitemap Implementation](#sitemap-implementation)
5. [RSS Feeds](#rss-feeds)
6. [Server Configuration Files](#server-configuration-files)
7. [SEO Files](#seo-files)
8. [Maintenance and Updates](#maintenance-and-updates)

## Structured Data Implementation

### Core SEO Component (`src/layout/SEO/index.tsx`)

The main SEO component provides comprehensive meta tags and structured data:

- **Basic Meta Tags**: title, description, keywords, author, robots, language
- **Open Graph Tags**: Complete social media optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Structured Data**: WebSite and Organization schemas
- **Article Support**: Publication dates, authors, sections, tags

### SEO Utilities (`src/utils/seo.ts`)

Utility functions for generating structured data:

- `generateProductStructuredData()` - For marketplace listings
- `generateArticleStructuredData()` - For card gallery items
- `generateBreadcrumbStructuredData()` - For navigation
- `generateCardStructuredData()` - For individual cards
- `generatePackStructuredData()` - For booster packs
- `generateFAQStructuredData()` - For FAQ sections
- `generateHowToStructuredData()` - For tutorials
- `generateLocalBusinessStructuredData()` - For business info
- `generateWebSiteStructuredData()` - For search functionality

### Page-Specific SEO

Each major page has dedicated head.tsx files with optimized SEO:

- **Gallery Cards** (`app/gallery/[id]/head.tsx`): CreativeWork schema + breadcrumbs
- **Marketplace Listings** (`app/marketplace/[id]/head.tsx`): Product schema + pricing
- **User Profiles** (`app/u/[username]/head.tsx`): Person schema + profile data
- **Booster Page** (`app/booster/head.tsx`): Pack schema + pack opening
- **Creator Page** (`app/creator/head.tsx`): HowTo schema + tutorial steps
- **Credits Page** (`app/credits/head.tsx`): Product schema + pricing packages

## Meta Tags and Head Components

### Enhanced Meta Tags

All pages include comprehensive meta tags:

```html
<!-- Basic SEO -->
<title>Page Title | PlayMore TCG</title>
<meta name="description" content="Page description" />
<meta name="keywords" content="relevant, keywords" />
<meta name="author" content="PlayMore TCG" />
<meta name="robots" content="index, follow" />
<meta name="language" content="English" />

<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Page description" />
<meta property="og:image" content="https://playmoretcg.com/image.jpg" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Page description" />
<meta name="twitter:image" content="https://playmoretcg.com/image.jpg" />
```

### Article-Specific Tags

For content pages, additional article tags are included:

```html
<meta property="article:published_time" content="2024-12-19T00:00:00Z" />
<meta property="article:modified_time" content="2024-12-19T00:00:00Z" />
<meta property="article:author" content="Author Name" />
<meta property="article:section" content="Category" />
<meta property="article:tag" content="Tag1" />
<meta property="article:tag" content="Tag2" />
```

## Robots.txt Configuration

### Comprehensive Robots.txt (`public/robots.txt`)

The robots.txt file includes:

- **User Agent Specific Rules**: Different rules for Googlebot, Bingbot, social media crawlers
- **Crawl Delays**: Optimized crawl rates for different bots
- **Bad Bot Blocking**: Blocks known problematic crawlers
- **Sitemap References**: Multiple sitemap locations
- **Security**: Blocks access to sensitive areas

### Key Features:

```txt
# Allow all crawlers by default
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /embed/

# Googlebot specific rules
User-agent: Googlebot
Allow: /
Disallow: /admin/
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

# Sitemaps
Sitemap: https://playmoretcg.com/sitemap.xml
Sitemap: https://playmoretcg.com/sitemap-gallery.xml
Sitemap: https://playmoretcg.com/sitemap-marketplace.xml
```

## Sitemap Implementation

### Multiple Sitemaps

The system generates multiple specialized sitemaps:

- **sitemap.xml**: Main sitemap index
- **sitemap-main.xml**: Core pages (home, creator, booster, etc.)
- **sitemap-gallery.xml**: Individual card pages
- **sitemap-marketplace.xml**: Marketplace listings
- **sitemap-users.xml**: User profile pages

### Enhanced Sitemap Configuration (`next-sitemap.config.js`)

```javascript
module.exports = {
  siteUrl: 'https://playmoretcg.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ['/admin/*', '/api/*', '/embed/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/embed/'],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    let priority = config.priority;
    let changefreq = config.changefreq;

    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/gallery/')) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
```

## RSS Feeds

### Multiple RSS Feeds

The system generates RSS feeds for different content types:

- **rss-latest-cards.xml**: Latest community-created cards
- **rss-marketplace.xml**: Latest marketplace listings
- **rss-news.xml**: Site news and updates
- **rss-index.xml**: RSS feed index

### RSS Feed Features

- **Image Support**: Includes card images in feeds
- **Author Information**: Credits content creators
- **Categories**: Organizes content by type
- **Publication Dates**: Proper date formatting
- **Atom Links**: Self-referencing links

## Server Configuration Files

### Apache Configuration (`public/.htaccess`)

Comprehensive Apache configuration with:

- **HTTPS Redirects**: Force secure connections
- **SEO Redirects**: Remove trailing slashes, canonical redirects
- **Security Headers**: CSP, X-Frame-Options, HSTS
- **Compression**: Gzip compression for all content types
- **Caching**: Optimized cache headers
- **Bad Bot Blocking**: Blocks malicious crawlers
- **Hotlink Protection**: Prevents image theft

### Nginx Configuration (`nginx.conf`)

Complete Nginx configuration with:

- **SSL Configuration**: Modern TLS settings
- **Security Headers**: Comprehensive security
- **Compression**: Gzip compression
- **Caching**: Static asset caching
- **Rate Limiting**: API and login protection
- **Bad Bot Blocking**: Pattern-based blocking

### IIS Configuration (`web.config`)

Windows IIS configuration with:

- **URL Rewrite Rules**: SEO-friendly redirects
- **Security Headers**: HTTP security headers
- **Compression**: Static and dynamic compression
- **Request Filtering**: File type restrictions
- **Custom Error Pages**: SEO-friendly error handling

## SEO Files

### Standard SEO Files

- **robots.txt**: Comprehensive crawler directives
- **sitemap.xml**: Main sitemap index
- **humans.txt**: Team and technology information
- **ads.txt**: Advertising transparency
- **app-ads.txt**: Mobile app advertising
- **security.txt**: Security contact information

### PWA Manifest (`public/manifest.json`)

Enhanced PWA manifest with:

- **App Information**: Name, description, icons
- **Shortcuts**: Quick access to key features
- **Categories**: App store categorization
- **Screenshots**: App store screenshots
- **Theme Colors**: Brand consistency

## Maintenance and Updates

### Regular Tasks

1. **Update Sitemaps**: Run `npm run generate:sitemaps` after content changes
2. **Update RSS Feeds**: Run `npm run generate:rss` for new content
3. **Review Robots.txt**: Update for new sections or blocked areas
4. **Monitor Search Console**: Track indexing and performance
5. **Update Structured Data**: Ensure schema markup is current

### Scripts

```bash
# Generate all SEO files
npm run generate:seo

# Generate sitemaps only
npm run generate:sitemaps

# Generate RSS feeds only
npm run generate:rss

# Build with SEO generation
npm run build
```

### Content Updates

When adding new content types:

1. **Create Head Component**: Add head.tsx for new page types
2. **Update Sitemap Generator**: Add new content to sitemap scripts
3. **Update RSS Generator**: Add new content to RSS feeds
4. **Update Robots.txt**: Add any new blocked areas
5. **Test Structured Data**: Validate schema markup

### Monitoring

- **Google Search Console**: Monitor indexing and performance
- **Bing Webmaster Tools**: Track Bing search performance
- **Schema.org Validator**: Validate structured data
- **Social Media Debuggers**: Test Open Graph and Twitter Cards

## Best Practices

### Content Optimization

- **Unique Titles**: Each page has unique, descriptive titles
- **Meta Descriptions**: Compelling descriptions under 160 characters
- **Keywords**: Relevant, natural keyword usage
- **Images**: Alt text and optimized file names
- **Internal Linking**: Strategic internal link structure

### Technical SEO

- **Page Speed**: Optimized loading times
- **Mobile Friendly**: Responsive design
- **HTTPS**: Secure connections throughout
- **Clean URLs**: SEO-friendly URL structure
- **Canonical URLs**: Prevent duplicate content

### Social Media

- **Open Graph**: Complete social media optimization
- **Twitter Cards**: Enhanced Twitter sharing
- **Image Optimization**: Proper image sizes and formats
- **Social Proof**: User-generated content integration

## Conclusion

This comprehensive SEO implementation provides:

- **Search Engine Optimization**: Complete structured data and meta tags
- **Social Media Optimization**: Enhanced sharing capabilities
- **Technical SEO**: Server configurations and performance
- **Content Discovery**: Sitemaps and RSS feeds
- **Security**: Protection against bad bots and hotlinking
- **Maintainability**: Automated generation and clear documentation

The implementation follows industry best practices and provides a solid foundation for search engine visibility and user engagement.
