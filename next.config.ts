import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // Disable strict mode
  // When using Next.js <Image> component with external URLs (like recipe images from Spoonacular API), you must explicitly allow those domains. Without this configuration, Next.js will refuse to load the images and throw the error you saw
  images: {
    remotePatterns: [
      {
        protocol: 'https', // Only allow HTTPS (secure) connections
        hostname: 'img.spoonacular.com', // The domain allowed to load images from
        port: '', // No specific port required (default 443 for HTTPS)
        pathname: '/**', // Allow all paths (/** means any path/subpath)
      },
    ],
  },
};

export default nextConfig;
