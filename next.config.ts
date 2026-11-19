import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The old portfolio link page now lives on the main site.
  async redirects() {
    return [{ source: "/more-projects", destination: "https://bookchaowalit.com/", permanent: true }];
  },
};

export default nextConfig;
