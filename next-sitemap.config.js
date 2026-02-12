/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://playmoretcg.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
  exclude: [
    '/admin/*',
    '/api/*',
    '/embed/*',
    '/test-auth',
    '/404',
    '/500',
    '/_next/*',
    '/static/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/embed/',
          '/test-auth',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/embed/', '/test-auth'],
      },
    ],
    additionalSitemaps: [
      'https://playmoretcg.com/sitemap.xml',
      'https://playmoretcg.com/sitemap-0.xml',
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    let priority = config.priority;
    let changefreq = config.changefreq;

    // Homepage gets highest priority
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }

    // Gallery and marketplace pages get high priority
    else if (path.startsWith('/gallery/') || path.startsWith('/marketplace/')) {
      priority = 0.8;
      changefreq = 'weekly';
    }

    // Booster and creator pages get medium-high priority
    else if (path.startsWith('/booster') || path.startsWith('/creator')) {
      priority = 0.7;
      changefreq = 'weekly';
    }

    // User profile pages get medium priority
    else if (path.startsWith('/u/')) {
      priority = 0.6;
      changefreq = 'monthly';
    }

    // Static pages get medium priority
    else if (['/privacy', '/terms', '/credits'].includes(path)) {
      priority = 0.5;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
};
