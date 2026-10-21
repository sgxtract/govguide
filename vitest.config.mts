import { defineConfig } from "vitest/config";

export default defineConfig({
  // Vite 8 understands the "@/…" paths from tsconfig.json by itself.
  resolve: { tsconfigPaths: true },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
  },
});
