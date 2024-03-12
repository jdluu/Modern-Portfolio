import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import tailwind from "@astrojs/tailwind";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
	integrations: [tailwind()],
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
