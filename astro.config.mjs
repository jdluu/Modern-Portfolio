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
  // Pin the local servers to IPv4 loopback. `astro dev` otherwise binds only
  // `localhost`, which resolves to ::1 on this host, so anything probing
  // 127.0.0.1 (hermes verify's readiness check) is refused while the server is
  // perfectly healthy. Both are loopback, so exposure is unchanged.
  server: { host: "127.0.0.1" },
  preview: { host: "127.0.0.1" },
  prefetch: true,
  vite: {
    // Allow the tailnet preview host (temporary local review setup).
    preview: { allowedHosts: ["debian.tail38ae82.ts.net"] },
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
