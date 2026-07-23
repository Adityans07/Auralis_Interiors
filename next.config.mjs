/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Bypass server-side optimization fetches that can fail behind corporate TLS interception.
    // The browser loads remote images directly instead.
    unoptimized: true,
    // Remote patterns are permissive here so mock placeholder services work.
    // Swap/remove when real image hosts are known.
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
