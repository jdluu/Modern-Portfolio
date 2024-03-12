import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import storyblok from "@storyblok/astro";
import { loadEnv } from "vite";

const env = loadEnv("", process.cwd(), "STORYBLOK");

// https://astro.build/config
export default defineConfig({
	integrations: [
		tailwind(),
		storyblok({
			accessToken: env.STORYBLOK_TOKEN,
			components: {
				blogPost: "storyblok/BlogPost",
				card: "storyblok/ProjectCard",
				grid: "storyblok/ProjectGrid",
			},
			apiOptions: {
				region: "us",
			},
		}),
	],
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr", "pt-br", "es"],
	},
});
