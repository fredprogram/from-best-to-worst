import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'export',
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lf-coze-web-cdn.coze.cn',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
