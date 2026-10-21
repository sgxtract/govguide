import type { NextConfig } from "next";

// Cache Components and Partial Prefetching stay off: every page is static
// content read from files at build time. See docs/decisions/0005.
const nextConfig: NextConfig = {};

export default nextConfig;
