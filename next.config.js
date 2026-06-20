/** @type {import('next').NextConfig} */

// Load the single root .env file for local development.
// On Vercel, env vars come from the dashboard — dotenv is a no-op there
// (it never overrides already-set process.env values).
require('dotenv').config({
  path: require('path').join(__dirname, '../.env'),
  override: false,
});

const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactStrictMode: true,

  // allowedDevOrigins is only needed in development (local device testing).
  // Never set this in production — it has no effect there anyway.
  ...(!isProd && {
    allowedDevOrigins: [
      '10.122.118.221',
      '192.168.*.*',
      '169.254.*.*',
    ],
  }),

  serverExternalPackages: ['googleapis', 'nodemailer'],

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection',           value: '1; mode=block' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // CORS for API routes — locked to production domain in prod
        source: '/api/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Origin',  value: process.env.NEXT_PUBLIC_SITE_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/stats/:match*',
        destination: 'https://cloud.umami.is/:match*',
      },
    ];
  },
};

module.exports = nextConfig;
