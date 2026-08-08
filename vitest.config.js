import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/*.test.js"],
    exclude: ["node_modules/**"],
    coverage: {
      provider: "v8",
      include: [
        "shared/**/*.js",
        "local-sync/**/*.js",
        "trash/**/*.js",
        "snapshots/**/*.js",
        "bookmarks-bridge/**/*.js",
        "search-enhance/**/*.js",
        "item-manager/**/*.js",
      ],
      exclude: ["**/*.test.js"],
    },
  },
});
