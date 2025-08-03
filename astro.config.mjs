import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import solidJs from "@astrojs/solid-js";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    site: "https://jluu.dev",
    integrations: [
        sitemap(),
        solidJs({ include: ['src/components/ui/**/*.tsx'] }),
        react({
            exclude: ['src/components/ui/**'],
            include: ['node_modules/@tinacms/**', 'tina/**']
        })
    ],
    i18n: {
        defaultLocale: "en",
        locales: ["en", "fr", "pt-br", "es"],
    },
    output: "static",
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