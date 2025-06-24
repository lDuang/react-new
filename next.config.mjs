const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: [
    "https://coderpath.dev",
    "https://coderpath.me",
  ],
};

module.exports = nextConfig; 