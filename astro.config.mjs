import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import qwikdev from "@qwikdev/astro";

// https://astro.build/config
export default defineConfig({
	integrations: [react(), qwikdev()],
});
