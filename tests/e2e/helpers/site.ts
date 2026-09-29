import { expect, type APIRequestContext, type Page } from "@playwright/test";

/** Canonical key for a route: no trailing slash, except for the site root. */
export function routeKey(path: string): string {
  const key = path.replace(/\/+$/, "");
  return key === "" ? "/" : key;
}

/** The global navigation destinations that every page must link to. */
export const PRIMARY_ROUTES = [
  "/",
  "/about",
  "/work",
  "/blog",
  "/contact",
] as const;

/**
 * Every page in the built site, read from the generated sitemap.
 *
 * The sitemap is the build's own manifest of what it published, so tests never
 * drift from the site: a new page is covered automatically, and a page that
 * silently stops being generated disappears from the suite too. The 404 page is
 * intentionally absent (it is reachable only by requesting a bad URL).
 */
export async function siteRoutes(
  request: APIRequestContext,
): Promise<string[]> {
  const indexRes = await request.get("/sitemap-index.xml");
  expect(indexRes.ok(), "/sitemap-index.xml should be served").toBeTruthy();

  const sitemapPaths = [
    ...(await indexRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g),
  ].map((match) => new URL(match[1]).pathname);
  expect(
    sitemapPaths.length,
    "sitemap index should reference at least one sitemap",
  ).toBeGreaterThan(0);

  const routes = new Set<string>();
  for (const sitemapPath of sitemapPaths) {
    const res = await request.get(sitemapPath);
    expect(res.ok(), `${sitemapPath} should be served`).toBeTruthy();
    for (const match of (await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
      routes.add(new URL(match[1]).pathname);
    }
  }

  // Guard against a vacuous pass: every loop in this suite asserts "nothing is
  // wrong", which trivially holds if the route list came back empty.
  expect(routes.size, "sitemap should list the site's pages").toBeGreaterThan(
    5,
  );
  return [...routes].sort();
}

/**
 * Scroll the whole document so lazy-loaded media starts fetching, then wait for
 * every image to settle.
 *
 * `loading="lazy"` images below the fold are never requested until they come
 * near the viewport, so a page-wide "images render" assertion is meaningless
 * without walking the page first.
 */
export async function loadLazyMedia(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    // Walk the document element, not body: body can stop short of the real
    // scroll extent, which leaves lazy images near the bottom never requested.
    // Re-read the height each step because loading images makes the page taller.
    let y = 0;
    while (y < document.documentElement.scrollHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) =>
        requestAnimationFrame(() => setTimeout(resolve, 50)),
      );
      y += step;
    }
    window.scrollTo(0, 0);
  });

  // A sweep can still miss an image that is rendered but never intersected the
  // viewport, and `Element.checkVisibility` reports CSS visibility rather than
  // viewport intersection, so such an image counts as "shown" while the browser
  // has never asked for it. Bring each pending one into view explicitly instead
  // of trusting the sweep to have covered every card.
  await page.evaluate(async () => {
    const shown = (img: HTMLImageElement) =>
      typeof img.checkVisibility === "function"
        ? img.checkVisibility({
            checkOpacity: true,
            checkVisibilityCSS: true,
          })
        : Boolean(img.offsetWidth || img.offsetHeight);

    const deadline = Date.now() + 8_000;
    for (let pass = 0; pass < 3; pass += 1) {
      const pending = Array.from(document.images).filter(
        (img) => shown(img) && !img.complete,
      );
      if (!pending.length) break;
      for (const img of pending) {
        img.scrollIntoView({ block: "center" });
        await new Promise((resolve) =>
          requestAnimationFrame(() => setTimeout(resolve, 120)),
        );
        if (Date.now() > deadline) break;
      }
      if (Date.now() > deadline) break;
    }
  });

  await page
    .waitForFunction(
      () => {
        // `checkVisibility` is the precise "is the user actually being shown this"
        // test: it accounts for hidden ancestors, `visibility` and opacity. A lazy
        // image inside a filtered or collapsed card is not shown, so the browser
        // never requests it.
        const shown = (img: HTMLImageElement) =>
          typeof img.checkVisibility === "function"
            ? img.checkVisibility({
                checkOpacity: true,
                checkVisibilityCSS: true,
              })
            : Boolean(img.offsetWidth || img.offsetHeight);
        return Array.from(document.images).every(
          (img) => !shown(img) || img.complete,
        );
      },
      undefined,
      { timeout: 15_000 },
    )
    // Best effort: this waits only for images that are on screen to settle. Anything
    // that never finishes is reported with its own detail by the image assertions,
    // which is far more useful than a bare timeout here.
    .catch(() => undefined);
}

/**
 * Reveal the nav links when they live behind the hamburger.
 *
 * Below 768px the nav panel is `hidden`/`inert`; above it the same panel is the
 * always-visible desktop nav. Tests must drive both without caring which.
 */
export async function openNavIfCollapsed(page: Page): Promise<void> {
  const toggle = page.getByRole("button", { name: "Toggle menu" });
  if (await toggle.isVisible()) {
    await toggle.click();
    await expect(
      page.getByRole("dialog", { name: "Main menu panel" }),
    ).toBeVisible();
  }
}

/**
 * Wait for finite CSS animations to finish.
 *
 * Audits must run against the resting state: the homepage hero fades its text
 * in, and an accessibility scan that samples mid-fade reads the blended
 * (partly transparent) colour, then reports a contrast failure on text that is
 * perfectly legible once it settles. Infinite background animations are
 * excluded because they never finish, and the whole wait is bounded so a stuck
 * animation cannot hang the suite.
 */
export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(() => {
    const finite = document
      .getAnimations()
      .filter(
        (animation) =>
          animation.effect?.getComputedTiming().iterations !== Infinity,
      );

    return Promise.race([
      Promise.all(
        finite.map((animation) => animation.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, 3_000)),
    ]);
  });
}

/**
 * Wait for smooth scrolling to stop.
 *
 * Anchor clicks scroll with `behavior: "smooth"`, so a position sampled straight
 * after a click reads mid-animation and an offset assertion then fails depending
 * on which way the animation happened to be passing. Requires either an observed
 * movement or a grace period before accepting stability, because a scroll that has
 * not started yet also looks perfectly stable. Bounded, so a scroll that never
 * settles cannot hang the suite.
 */
export async function settleScroll(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const started = performance.now();
        let last = window.scrollY;
        let stable = 0;
        let moved = false;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          resolve();
        };
        const tick = () => {
          const y = window.scrollY;
          if (y !== last) {
            moved = true;
            stable = 0;
          } else {
            stable += 1;
          }
          last = y;
          if (stable >= 3 && (moved || performance.now() - started > 400)) {
            return finish();
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        setTimeout(finish, 6_000);
      }),
  );
}

/**
 * Wait until the DOM stops mutating.
 *
 * Hydrated islands re-render after load. The work page is the sharp example: it
 * server-renders every project card, then the paginating island hides all but the
 * current page, collapsing the hidden ones to a zero-size box. A locator resolved
 * before that settles points at an element that is about to vanish, so a click
 * either targets the wrong card or fails on an element that was visible when it
 * was resolved. Bounded, so a page that never settles cannot hang the suite.
 */
export async function settleDom(page: Page, quietMs = 300): Promise<void> {
  await page.evaluate(
    (quiet) =>
      new Promise<void>((resolve) => {
        let timer = 0;
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          observer.disconnect();
          resolve();
        };
        // Declared after finish, which only ever runs from a timer or an observer
        // callback, so the binding is always initialised by the time it is read.
        const observer = new MutationObserver(() => {
          clearTimeout(timer);
          timer = window.setTimeout(finish, quiet);
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        timer = window.setTimeout(finish, quiet);
        setTimeout(finish, 5_000);
      }),
    quietMs,
  );
}

/** The nav panel, scoped so link lookups cannot collide with in-page links. */
export function navPanel(page: Page) {
  return page.getByRole("navigation", { name: "Main navigation" });
}
