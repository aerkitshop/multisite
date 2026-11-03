import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: { unoptimized: true },
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
