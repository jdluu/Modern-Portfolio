import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import icon from "astro-icon";
import rehypeSlug from "rehype-slug";

// https://astro.build/config
export default defineConfig({
  site: "https://jluu.dev",
  base: "/",
  markdown: {
    processor: unified({
      rehypePlugins: [rehypeSlug],
    }),
  },
  integrations: [
    sitemap(),
    solidJs({ include: ["src/components/**/*.tsx"] }),
    icon(),
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  output: "static",
  prefetch: true,
  vite: {
    build: {
      target: "es2024",
      sourcemap: false,
      // esbuild minification (Vite default): faster builds, comparable output.
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
