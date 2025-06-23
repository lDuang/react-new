// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... 其他配置，例如 reactStrictMode: true
  // 如果您在 Cloud Studio 等在线环境中遇到跨域警告，可以添加此项
  allowedDevOrigins: [
    "https://qjczsa-vzpdmo-3000.app.cloudstudio.work", // 替换为您的实际域名
    // 如果有其他开发环境的域名，也可以添加
  ],
};

export default nextConfig;