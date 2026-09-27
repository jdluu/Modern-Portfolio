import type { Response } from "@playwright/test";
import { expect, test } from "./helpers/fixtures";
import { loadLazyMedia, routeKey } from "./helpers/site";

/** Resource types whose failure means something on the page is visibly broken. */
const MEDIA_RESOURCE_TYPES = ["image", "media", "font", "script", "stylesheet"];

/** Smallest bitmap we accept as real content. The repo's stub-media incident was 8x8. */
const MIN_BITMAP_EDGE = 32;

/** Smallest rendered box we accept for an image that is actually painting. */
const MIN_PAINTED_EDGE = 8;

test.describe("images and media render", () => {
  test("every image on every page loads and paints at a real size", async ({
    page,
    routes,
  }) => {
    const problems: string[] = [];
    let imagesChecked = 0;

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route, { waitUntil: "load" });
        await loadLazyMedia(page);

        const images = await page.evaluate(() =>
          Array.from(document.images).map((img) => {
            const rect = img.getBoundingClientRect();
            return {
              src: (img.currentSrc || img.src).replace(
                window.location.origin,
                "",
              ),
              hasAltAttribute: img.hasAttribute("alt"),
              alt: img.getAttribute("alt") ?? "",
              decoded: img.complete && img.naturalWidth > 0,
              natural: [img.naturalWidth, img.naturalHeight],
              // `checkVisibility` is the precise "is the user actually being shown this"
              // test: it accounts for hidden ancestors, `visibility` and opacity. A
              // lazy image inside a filtered or collapsed card is not shown, so the
              // browser never requests it and it must not count as broken.
              painted:
                typeof img.checkVisibility === "function"
                  ? img.checkVisibility({
                      checkOpacity: true,
                      checkVisibilityCSS: true,
                    })
                  : Boolean(img.offsetWidth || img.offsetHeight),
              rendered: [Math.round(rect.width), Math.round(rect.height)],
            };
          }),
        );

        imagesChecked += images.length;

        for (const img of images) {
          const where = `${routeKey(route)} -> ${img.src}`;

          if (!img.hasAltAttribute) {
            problems.push(`${where}: missing alt attribute entirely`);
          }
          if (img.alt.trim() && img.alt.length > 200) {
            problems.push(
              `${where}: alt text is ${img.alt.length} chars, too long to be useful`,
            );
          }
          if (!img.decoded) {
            // Only a *rendered* image must have a bitmap. The browser never requests a
            // lazy image inside a hidden filter or pagination container, so it has none
            // and there is nothing to verify. A request that actually failed still
            // shows up in the response-status sweep below.
            if (img.painted) {
              problems.push(
                `${where}: rendered image never decoded (naturalWidth is 0)`,
              );
            }
            continue;
          }
          if (
            img.natural[0] < MIN_BITMAP_EDGE ||
            img.natural[1] < MIN_BITMAP_EDGE
          ) {
            problems.push(
              `${where}: bitmap is only ${img.natural.join("x")} - placeholder or stub media`,
            );
          }
          if (
            img.painted &&
            (img.rendered[0] < MIN_PAINTED_EDGE ||
              img.rendered[1] < MIN_PAINTED_EDGE)
          ) {
            problems.push(
              `${where}: paints in a ${img.rendered.join("x")} box, so it is effectively invisible`,
            );
          }
        }
      });
    }

    expect(
      imagesChecked,
      "expected the site to contain images to check",
    ).toBeGreaterThan(0);
    expect(problems, `${problems.length} broken image(s)`).toEqual([]);
  });

  test("no page requests a missing media, script, style or font file", async ({
    page,
    routes,
  }) => {
    const failures: string[] = [];

    for (const route of routes) {
      await test.step(route, async () => {
        const onResponse = (res: Response) => {
          const type = res.request().resourceType();
          if (res.status() >= 400 && MEDIA_RESOURCE_TYPES.includes(type)) {
            failures.push(
              `${routeKey(route)}: ${res.status()} ${type} ${res.url()}`,
            );
          }
        };

        page.on("response", onResponse);
        await page.goto(route, { waitUntil: "load" });
        await loadLazyMedia(page);
        page.off("response", onResponse);
      });
    }

    expect(failures, `${failures.length} failed request(s)`).toEqual([]);
  });

  test("every demo video has a decodable source and a working poster", async ({
    page,
    request,
    routes,
  }) => {
    const problems: string[] = [];
    let videosChecked = 0;

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route, { waitUntil: "load" });

        const count = await page.locator("video").count();
        if (count === 0) return;
        expect(
          count,
          `${routeKey(route)} should render exactly one demo video`,
        ).toBe(1);
        videosChecked += 1;

        const video = page.locator("video").first();
        // Wait for metadata so videoWidth/duration reflect the real file, not a stub.
        await video.evaluate(
          (el) =>
            new Promise<void>((resolve) => {
              const node = el as HTMLVideoElement;
              if (node.readyState >= 1) {
                resolve();
                return;
              }
              node.addEventListener("loadedmetadata", () => resolve(), {
                once: true,
              });
              node.addEventListener("error", () => resolve(), { once: true });
              setTimeout(() => resolve(), 10_000);
            }),
        );

        const info = await video.evaluate((el) => {
          const node = el as HTMLVideoElement;
          const rect = node.getBoundingClientRect();
          return {
            poster: node.getAttribute("poster"),
            sources: Array.from(node.querySelectorAll("source")).map(
              (source) => ({
                src: source.getAttribute("src"),
                type: source.getAttribute("type"),
              }),
            ),
            width: node.videoWidth,
            height: node.videoHeight,
            duration: node.duration,
            rendered: [Math.round(rect.width), Math.round(rect.height)],
          };
        });

        const where = routeKey(route);

        if (!info.poster) {
          problems.push(
            `${where}: video has no poster, so it renders as a blank box`,
          );
        } else {
          const res = await request.get(info.poster);
          const contentType = res.headers()["content-type"] ?? "";
          const length = Number(res.headers()["content-length"] ?? 0);
          if (!res.ok())
            problems.push(
              `${where}: poster ${info.poster} returned ${res.status()}`,
            );
          else if (!contentType.startsWith("image/"))
            problems.push(`${where}: poster is not an image (${contentType})`);
          else if (length > 0 && length < 1024)
            problems.push(
              `${where}: poster is only ${length} bytes - placeholder media`,
            );
        }

        if (info.sources.length === 0)
          problems.push(`${where}: video has no <source> elements`);

        for (const source of info.sources) {
          if (!source.src) {
            problems.push(`${where}: a <source> has no src`);
            continue;
          }
          if (!source.type)
            problems.push(
              `${where}: source ${source.src} declares no MIME type`,
            );
          const res = await request.get(source.src);
          const length = Number(res.headers()["content-length"] ?? 0);
          if (!res.ok())
            problems.push(
              `${where}: source ${source.src} returned ${res.status()}`,
            );
          else if (length > 0 && length < 4096)
            problems.push(
              `${where}: source ${source.src} is only ${length} bytes - placeholder`,
            );
        }

        if (
          !(info.width > 0 && info.height > 0) ||
          !Number.isFinite(info.duration) ||
          info.duration <= 0
        ) {
          problems.push(
            `${where}: video did not decode (${info.width}x${info.height}, duration ${info.duration})`,
          );
        }
        if (info.rendered[0] < 100 || info.rendered[1] < 100) {
          problems.push(
            `${where}: video paints in a ${info.rendered.join("x")} box`,
          );
        }
      });
    }

    expect(
      videosChecked,
      "expected the site to contain demo videos",
    ).toBeGreaterThan(0);
    expect(problems, `${problems.length} video problem(s)`).toEqual([]);
  });

  test("final-product lightboxes open onto a real full-size image", async ({
    page,
    routes,
  }) => {
    const problems: string[] = [];
    let pagesWithLightbox = 0;

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route, { waitUntil: "load" });
        await loadLazyMedia(page);

        const trigger = page.locator(".hero-trigger");
        if ((await trigger.count()) === 0) return;
        pagesWithLightbox += 1;

        const lightbox = page.locator("#image-lightbox");
        const modalImage = lightbox.locator("img");

        await trigger.first().click();
        await expect(
          lightbox,
          `${routeKey(route)}: lightbox should open`,
        ).toBeVisible();
        await expect(modalImage).toBeVisible();

        await expect
          .poll(
            () =>
              modalImage.evaluate(
                (img) => (img as HTMLImageElement).naturalWidth,
              ),
            {
              timeout: 10_000,
              message: `${routeKey(route)}: full-size image should decode once the lightbox opens`,
            },
          )
          .toBeGreaterThan(MIN_BITMAP_EDGE);

        const rendered = await modalImage.evaluate((img) => {
          const rect = img.getBoundingClientRect();
          return [Math.round(rect.width), Math.round(rect.height)];
        });

        // Absolute pixel thresholds are wrong here: on a 393px phone a wide image is
        // correctly scaled down to ~354x162 by max-width. What matters is that it is
        // drawn large enough to be worth opening.
        if (Math.max(rendered[0], rendered[1]) < 200) {
          problems.push(
            `${routeKey(route)}: lightbox image paints in a ${rendered.join("x")} box, too small for a full-size view`,
          );
        }
        // Comparing box ratios to source ratios is wrong: `max-width`/`max-height` shrink
        // the element box (1152x612 at 1280x720) and the image is letterboxed inside it
        // by object-fit, so the box ratio says nothing about distortion. `contain`
        // guarantees the image is scaled to fit without cropping or stretching, which
        // is exactly what a full-size view must do.
        const objectFit = await modalImage.evaluate(
          (img) => getComputedStyle(img).objectFit,
        );
        if (objectFit !== "contain") {
          problems.push(
            `${routeKey(route)}: lightbox image uses object-fit: ${objectFit}, so opening it can crop or stretch the image`,
          );
        }

        await page.keyboard.press("Escape");

        // Assert the accessible closed state rather than Playwright's visibility
        // heuristic: `.lightbox` is display:flex and only fades to opacity 0, so it
        // always keeps a box and is never "hidden" in the CSS sense.
        const closed = await lightbox.evaluate((el) => ({
          hiddenAttribute: el.hasAttribute("hidden"),
          ariaHidden: el.getAttribute("aria-hidden"),
          inert: (el as HTMLElement).inert,
        }));
        if (
          !closed.hiddenAttribute ||
          closed.ariaHidden !== "true" ||
          !closed.inert
        ) {
          problems.push(
            `${routeKey(route)}: Escape left the lightbox reachable (${JSON.stringify(closed)})`,
          );
        }

        const expanded = await trigger.first().getAttribute("aria-expanded");
        if (expanded !== "false") {
          problems.push(
            `${routeKey(route)}: trigger aria-expanded is ${expanded} after closing`,
          );
        }
      });
    }

    expect(
      pagesWithLightbox,
      "expected at least one page with a final-product lightbox",
    ).toBeGreaterThan(0);
    expect(problems, `${problems.length} lightbox problem(s)`).toEqual([]);
  });
});
