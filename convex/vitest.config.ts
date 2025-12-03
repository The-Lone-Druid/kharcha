/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from "path";

// Vitest config specifically for Convex function tests
// Uses edge-runtime to match Convex's execution environment
export default defineConfig({
  test: {
    name: "convex",
    environment: "edge-runtime",
    include: ["**/*.test.ts"],
    exclude: ["node_modules", "_generated"],
    server: {
      deps: {
        inline: ["convex-test"],
      },
    },
  },
  resolve: {
    alias: {
      "@convex": path.resolve(__dirname, "."),
    },
  },
});
