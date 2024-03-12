import { defineConfig } from "astro/config";
import storyblok from "@storyblok/astro";
import { loadEnv } from "vite";
import tailwind from "@astrojs/tailwind";
import basicSsl from "@vitejs/plugin-basic-ssl";
const env = loadEnv("", process.cwd(), "STORYBLOK");

export default defineConfig({
	integrations: [
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
		tailwind(),
	],
	i18n: {
		defaultLocale: "en",
		locales: ["en", "fr", "pt-br", "es"],
	},
	vite: {
		plugins: [basicSsl()],
		server: {
			https: true,
		},
	},
});
