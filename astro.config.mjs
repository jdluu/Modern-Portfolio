import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
	site: "https://jluu.dev",
	integrations: [tailwind(), sitemap(), react()],
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
							if (id.includes("react") || id.includes("react-dom")) {
								return "react-vendor";
							}
							if (id.includes("@astrojs")) {
								return "astro-vendor";
							}
							return "vendor";
						}
					},
				},
			},
		},
		optimizeDeps: {
			include: ["react", "react-dom", "@astrojs/react"],
		},
	},
	prerender: {
		default: true,
	},
});
