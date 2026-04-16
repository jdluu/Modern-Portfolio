import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // @ts-expect-error: resolve.tsconfigPaths is a valid Vite 5+ option but may not be in all @types/vite yet
    tsconfigPaths: true,
  },
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**"],
  },
});
