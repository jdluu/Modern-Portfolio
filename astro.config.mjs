import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  site: "https://jluu.dev",
  base: "/",
  integrations: [
    sitemap(),
    solidJs({ include: ["src/components/ui/**/*.tsx"] }),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  output: "static",
  // Allow remote image optimization for CMS-hosted images.
  // This is permissive (all HTTPS). Tighten with specific hostnames if desired.
  image: {
    remotePatterns: [{ protocol: "https" }],
  },
  vite: {
    build: {
      target: "es2018",
      sourcemap: false,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        format: {
          comments: false,
        },
      },
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes("node_modules")) {
              if (id.includes("@astrojs")) {
                return "astro-vendor";
              }
              return "vendor";
            }
          },
        },
      },
    },
  },
  prerender: {
    default: true,
  },
});
