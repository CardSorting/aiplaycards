const nextConfig = {
  pageExtensions: ['page.tsx', 'ts', 'tsx', 'js', 'jsx'],
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Speed up builds by skipping type checking (run separately in CI)
    ignoreBuildErrors: true,
  },
  // Enable standalone output for smaller Docker images (commented out if causing issues)
  // output: 'standalone',
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },
  // Performance optimizations
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  compress: true,
  serverExternalPackages: ['pg', 'pg-boss'],
  webpack: (config, { isServer }) => {
    config.ignoreWarnings = [
      { module: /node_modules\/replicate\/lib\/util\.js/ },
    ];

    // Optimize build performance
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        os: false,
        crypto: false,
        buffer: false,
        util: false,
      };
    }

    return config;
  },
};

// Only use bundle analyzer if available and enabled
let config = nextConfig;
if (process.env.ANALYZE === 'true') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: true,
    });
    config = withBundleAnalyzer(nextConfig);
  } catch (err) {
    console.warn('Bundle analyzer not available:', err.message);
    // Continue with default config if bundle analyzer is not available
  }
}

module.exports = config;
