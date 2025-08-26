/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    FMP_API_KEY: process.env.FMP_API_KEY,
    FINNHUB_API_KEY: process.env.FINNHUB_API_KEY,
  }
}

module.exports = nextConfig
