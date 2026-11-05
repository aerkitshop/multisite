import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    // Payload media (/api/media/file/*) is resized + converted to WebP by Next's optimizer
    // (sharp) and cached in .next/cache/images.
    localPatterns: [{ pathname: '/api/media/file/**' }],
    formats: ['image/webp'],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }
    return webpackConfig
  },
  reactStrictMode: true,
  async rewrites() {
    return {
      beforeFiles: [
        {
          // Domain-based multi-tenancy: <host>/<path> -> /<host>/<path>
          // (app/(frontend)/[tenant]). Bare "localhost" is NOT rewritten so the
          // admin is reachable at http://localhost:3000/admin.
          // Excluded: /admin, /api, /_next and root static files.
          source:
            '/:path((?!admin(?:/|$)|api(?:/|$)|_next(?:/|$)|favicon\\.ico$|favicon\\.svg$).*)*',
          destination: '/:tenant/:path*',
          has: [{ type: 'host', value: '(?<tenant>(?!localhost$|127\\.0\\.0\\.1$).*)' }],
        },
      ],
    }
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
