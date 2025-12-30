import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_S3_OBJECT_URL?.slice(8) as string,
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
