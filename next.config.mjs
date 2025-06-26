// import path from "path";
// import nextBundleAnalyzer from '@next/bundle-analyzer';

// const withBundleAnalyzer = nextBundleAnalyzer({
//   enabled: process.env.ANALYZE === 'true',
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone',
  allowedDevOrigins: [
    "https://coderpath.dev",
    "https://coderpath.me",
    "https://qjczsa-vzpdmo-3000.app.cloudstudio.work"
  ],
};

export default withBundleAnalyzer(nextConfig);