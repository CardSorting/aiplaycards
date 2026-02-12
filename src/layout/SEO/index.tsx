import Head from 'next/head';
import { FC, useMemo } from 'react';

interface SEOProps {
  description: string;
  title?: string;
  siteTitle?: string;
  fullTitle?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  // New props for enhanced SEO
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: any;
  noindex?: boolean;
  nofollow?: boolean;
  alternateLanguages?: { [key: string]: string };
  twitterCreator?: string;
  twitterSite?: string;
  articleAuthor?: string;
  articleSection?: string;
  articleTags?: string[];
}

const SEO: FC<SEOProps> = ({
  description,
  title,
  siteTitle = 'PlayMoreTCG.com',
  fullTitle,
  image = 'https://playmoretcg.com/assets/images/banner.png',
  url,
  type = 'website',
  keywords = 'Pokemon cards, AI card generator, custom Pokemon cards, TCG creator, card maker, booster packs, digital trading cards, collectible cards',
  author = 'PlayMore TCG',
  publishedTime,
  modifiedTime,
  section: _section,
  tags: _tags = [],
  structuredData,
  noindex = false,
  nofollow = false,
  alternateLanguages,
  twitterCreator = '@playmoretcg',
  twitterSite = '@playmoretcg',
  articleAuthor,
  articleSection,
  articleTags = [],
}) => {
  const finalTitle = useMemo<string>(
    () => fullTitle ?? `${title} | ${siteTitle}`,
    [fullTitle, title, siteTitle],
  );

  // Default structured data for the website
  const defaultStructuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteTitle,
      url: 'https://playmoretcg.com',
      description:
        'Create your own custom Pokémon cards in the modern Sword and Shield format, including Pokémon-V, V-Max and Full Art Trainers!',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://playmoretcg.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    }),
    [siteTitle],
  );

  // Organization structured data
  const organizationStructuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'PlayMore TCG',
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
      },
    }),
    [],
  );

  const robotsContent = useMemo(() => {
    const directives = [];
    if (noindex) directives.push('noindex');
    if (nofollow) directives.push('nofollow');
    return directives.length > 0 ? directives.join(', ') : 'index, follow';
  }, [noindex, nofollow]);

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />

      {/* Viewport and Theme */}
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, shrink-to-fit=no"
      />
      <meta name="theme-color" content="#007AFF" />
      <meta name="color-scheme" content="light dark" />
      <meta name="msapplication-TileColor" content="#007AFF" />

      {/* Canonical URL */}
      {url && <link rel="canonical" href={url} />}

      {/* Alternate Languages */}
      {alternateLanguages &&
        Object.entries(alternateLanguages).map(([lang, href]) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image:alt"
        content="PlayMoreTCG - AI-powered Pokemon card creator"
      />
      <meta property="og:locale" content="en_US" />
      {url && <meta property="og:url" content={url} />}

      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {publishedTime && (
            <meta property="article:published_time" content={publishedTime} />
          )}
          {modifiedTime && (
            <meta property="article:modified_time" content={modifiedTime} />
          )}
          {articleAuthor && (
            <meta property="article:author" content={articleAuthor} />
          )}
          {articleSection && (
            <meta property="article:section" content={articleSection} />
          )}
          {articleTags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta
        name="twitter:image:alt"
        content="PlayMoreTCG - AI-powered Pokemon card creator"
      />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />

      {/* Apple */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />

      {/* PWA */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(defaultStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

export { SEO };
export default SEO;
