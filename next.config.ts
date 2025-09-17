import type { NextConfig } from "next";

console.log("\n[NEXT CONFIG] Loaded environment variables:");
console.log("[NEXT CONFIG] DATABASE_URL:", process.env.DATABASE_URL ? "✅ Found" : "❌ Not Found");
console.log("[NEXT CONFIG] NEXT_PUBLIC_APP_URL:", process.env.NEXT_PUBLIC_APP_URL || "⚠️ Not Set");

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
