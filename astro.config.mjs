import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
	site: "https://jluu.dev",
	integrations: [tailwind(), sitemap()],
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr", "pt-br", "es"],
	},
});
