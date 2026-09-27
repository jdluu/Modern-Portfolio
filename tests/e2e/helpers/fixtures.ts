import { test as base } from "@playwright/test";
import { siteRoutes } from "./site";

/**
 * Playwright test with the site's page inventory supplied as a fixture.
 *
 * The route list is resolved once per worker from the sitemap and then shared by
 * every test, so a site-wide sweep costs one fetch instead of one per assertion.
 */
export const test = base.extend<{ routes: string[] }>({
  routes: async ({ request }, use) => {
    await use(await siteRoutes(request));
  },
});

export { expect } from "@playwright/test";
