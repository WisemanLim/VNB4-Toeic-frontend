/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: process.env.NEXT_OUTPUT_EXPORT === "true" ? "export" : undefined, // Tauri build uses export
  images: { unoptimized: process.env.NEXT_OUTPUT_EXPORT === "true" },
  async rewrites() {
    if (process.env.NEXT_OUTPUT_EXPORT === "true") return [];
    return [
      { source: "/api/:path*", destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/:path*` },
    ];
  },
};
export default nextConfig;
