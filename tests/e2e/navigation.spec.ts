import { expect, test } from "./helpers/fixtures";
import {
  PRIMARY_ROUTES,
  navPanel,
  openNavIfCollapsed,
  routeKey,
} from "./helpers/site";

/** The destinations exposed by the global nav, with the title each must land on. */
const NAV_LINKS = [
  { name: "About", path: "/about", title: /About Jeffrey Luu/ },
  { name: "Work", path: "/work", title: /Experience & Projects/ },
  { name: "Blog", path: "/blog", title: /^Blog$/ },
  { name: "Contact", path: "/contact", title: /Contact Information/ },
] as const;

const HOME_TITLE = /Jeffrey Luu/;

test.describe("navigation", () => {
  test.describe.configure({ timeout: 180_000 });

  test("every page links to every primary page", async ({ page, routes }) => {
    const problems: string[] = [];

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route, { waitUntil: "load" });
        await openNavIfCollapsed(page);

        for (const target of PRIMARY_ROUTES) {
          // Must be *visible*: the desktop-only logo link is first in the DOM and is
          // hidden at mobile widths, so an unfiltered match proves nothing.
          const link = navPanel(page).locator(`a[href="${target}"]:visible`);
          if ((await link.count()) === 0) {
            problems.push(`${routeKey(route)}: no visible link to ${target}`);
          }
        }
      });
    }

    expect(problems, `${problems.length} missing nav link(s)`).toEqual([]);
  });

  test("the nav navigates from every page to every primary page, and home", async ({
    page,
    routes,
  }) => {
    const problems: string[] = [];

    for (const route of routes) {
      await test.step(route, async () => {
        // Each click starts from the same page, so one bad link cannot mask the rest.
        for (const target of NAV_LINKS) {
          await page.goto(route, { waitUntil: "load" });
          await openNavIfCollapsed(page);

          await navPanel(page)
            .locator(`a[href="${target.path}"]:visible`)
            .first()
            .click();

          try {
            await expect(page).toHaveURL(new RegExp(`${target.path}/?$`), {
              timeout: 10_000,
            });
            await expect(page).toHaveTitle(target.title, { timeout: 10_000 });
          } catch {
            problems.push(
              `${routeKey(route)}: clicking "${target.name}" did not land on ${target.path} (at ${new URL(page.url()).pathname})`,
            );
          }
        }

        // And back to the root, from wherever we are.
        await page.goto(route, { waitUntil: "load" });
        await openNavIfCollapsed(page);
        // Either the desktop logo link or the nav panel's own home link, whichever is
        // actually rendered: `.panel-header` is hidden at desktop widths and the logo
        // link is hidden at mobile widths.
        const homeLink = navPanel(page).locator('a[href="/"]:visible').first();
        await homeLink.click();
        try {
          await expect(page).toHaveURL(/\/$/, { timeout: 10_000 });
          await expect(page).toHaveTitle(HOME_TITLE, { timeout: 10_000 });
        } catch {
          problems.push(
            `${routeKey(route)}: clicking the home link did not return to /`,
          );
        }
      });
    }

    expect(problems, `${problems.length} navigation failure(s)`).toEqual([]);
  });

  test("every page is reachable from every other page, forwards and backwards", async ({
    page,
    routes,
  }) => {
    const keys = routes.map(routeKey);
    const known = new Set(keys);
    const graph = new Map<string, Set<string>>();
    const deadLinks: string[] = [];

    for (const route of routes) {
      await test.step(`map ${route}`, async () => {
        await page.goto(route, { waitUntil: "load" });
        const origin = new URL(page.url()).origin;

        const hrefs = await page.$$eval("a[href]", (anchors) =>
          anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
        );

        const targets = new Set<string>();
        for (const href of hrefs) {
          let url: URL;
          try {
            url = new URL(href);
          } catch {
            continue;
          }
          if (url.origin !== origin) continue;

          const key = routeKey(url.pathname);
          if (known.has(key)) {
            targets.add(key);
          } else if (!/\.[a-z0-9]+$/i.test(url.pathname)) {
            // Internal, looks like a page, but is not a page the build produced.
            deadLinks.push(`${routeKey(route)} -> ${url.pathname}`);
          }
        }
        graph.set(routeKey(route), targets);
      });
    }

    expect(deadLinks, `links point at pages that were never built`).toEqual([]);

    // Breadth-first search, returning how many hops each page takes.
    const hopsFrom = (start: string): Map<string, number> => {
      const hops = new Map([[start, 0]]);
      const queue = [start];
      while (queue.length) {
        const current = queue.shift() as string;
        const distance = hops.get(current) as number;
        for (const next of graph.get(current) ?? []) {
          if (!hops.has(next)) {
            hops.set(next, distance + 1);
            queue.push(next);
          }
        }
      }
      return hops;
    };

    const unreachable: string[] = [];
    let worstCase = 0;
    let worstPair = "";

    for (const from of keys) {
      const hops = hopsFrom(from);
      for (const to of keys) {
        if (to === from) continue;
        const distance = hops.get(to);
        if (distance === undefined) {
          unreachable.push(`${from} cannot reach ${to}`);
        } else if (distance > worstCase) {
          worstCase = distance;
          worstPair = `${from} -> ${to}`;
        }
      }
    }

    expect(graph.size, "expected a link graph covering every page").toBe(
      keys.length,
    );
    expect(
      unreachable,
      `${unreachable.length} unreachable direction(s); deepest working path is ${worstCase} hops (${worstPair})`,
    ).toEqual([]);
  });

  test("browser back and forward restore the previous pages", async ({
    page,
    routes,
  }) => {
    const home = routes.find((route) => routeKey(route) === "/");
    const work = routes.find((route) => routeKey(route) === "/work");
    const detail = routes.find((route) =>
      routeKey(route).startsWith("/projects/"),
    );

    expect(home, "site should contain the home page").toBeTruthy();
    expect(work, "site should contain the work page").toBeTruthy();
    expect(detail, "site should contain a project detail page").toBeTruthy();

    await page.goto(home as string);
    const homeTitle = await page.title();
    await page.goto(work as string);
    const workTitle = await page.title();
    await page.goto(detail as string);
    const detailTitle = await page.title();

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${routeKey(work as string)}/?$`));
    await expect(page).toHaveTitle(workTitle);

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${routeKey(home as string)}/?$`));
    await expect(page).toHaveTitle(homeTitle);

    await page.goForward();
    await expect(page).toHaveTitle(workTitle);

    await page.goForward();
    await expect(page).toHaveTitle(detailTitle);
  });
});
