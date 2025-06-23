// next.config.ts
import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // ... 其他配置，例如 reactStrictMode: true
  // 如果您在 Cloud Studio 等在线环境中遇到跨域警告，可以添加此项
  allowedDevOrigins: [
    "https://coderpath.dev", // 替换为您的实际域名
    "https://coderpath.me", // 替换为您的实际域名
    // 如果有其他开发环境的域名，也可以添加
  ],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(process.cwd(), 'src'),
    };
    return config;
  },
};

export default nextConfig;