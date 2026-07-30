/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    // 기능명세서 아카이브(public/docs)를 /docs 로 접근 가능하게
    return [
      { source: "/docs", destination: "/docs/index.html" },
      { source: "/docs/", destination: "/docs/index.html" }
    ];
  }
};

module.exports = nextConfig;
