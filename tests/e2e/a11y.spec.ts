import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { expect, test } from "./helpers/fixtures";
import { routeKey, settleAnimations } from "./helpers/site";

/**
 * Minimal shape of an axe violation. `axe-core` is not a direct dependency
 * (pnpm's isolated node_modules hides transitive packages), so the fields used
 * here are declared locally rather than imported.
 */
type AxeViolationNode = {
  target: Array<string | string[]>;
  failureSummary?: string;
};
type AxeViolation = {
  id: string;
  impact?: string | null;
  help: string;
  nodes: AxeViolationNode[];
};

/** WCAG 2.0, 2.1 and 2.2 rules at Level A and AA - the conformance target. */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/** Heading levels may only increase by one at a time. */
const MAX_HEADING_STEP = 1;

function describeViolations(
  route: string,
  violations: AxeViolation[],
): string[] {
  return violations.map((violation) => {
    const nodes = violation.nodes
      .slice(0, 4)
      .map((node) => {
        const target = node.target.join(" ");
        return `        ${target}\n          ${node.failureSummary?.replaceAll("\n", "\n          ") ?? ""}`;
      })
      .join("\n");
    const overflow =
      violation.nodes.length > 4
        ? `\n        ...and ${violation.nodes.length - 4} more`
        : "";
    return `    ${routeKey(route)} [${violation.impact}] ${violation.id}: ${violation.help}\n${nodes}${overflow}`;
  });
}

/**
 * Load a route, let entrance animations settle, then run axe with the given tags.
 *
 * Settling first is not optional: the homepage hero fades its text in, and axe
 * samples colour as soon as it runs, so scanning mid-fade reports blended
 * (semi-transparent) foregrounds and fails contrast on text that is legible at
 * rest.
 */
async function auditRoute(page: Page, route: string, tags: string[]) {
  await page.goto(route, { waitUntil: "load" });
  // Open every disclosure before auditing. Chrome reports a layout box for
  // content inside a closed <details> while painting none of it, and axe only
  // audits what is rendered - so the coursework appendices went unchecked, and a
  // 3.86:1 table header sat in there at 9.5px, well under the 4.5:1 AA floor.
  await page.evaluate(() => {
    for (const d of document.querySelectorAll("details:not([open])")) {
      d.setAttribute("open", "");
    }
  });
  await settleAnimations(page);
  return new AxeBuilder({ page }).withTags(tags).analyze();
}

test.describe("accessibility (WCAG 2.2 A/AA)", () => {
  test.describe.configure({ timeout: 180_000 });

  test("no WCAG A/AA violations on any page in light theme", async ({
    page,
    routes,
  }) => {
    const violations: string[] = [];

    for (const route of routes) {
      await test.step(route, async () => {
        const results = await auditRoute(page, route, WCAG_TAGS);
        violations.push(...describeViolations(route, results.violations));
      });
    }

    expect(violations, `${violations.length} WCAG violation(s)`).toEqual([]);
  });

  test("no WCAG A/AA violations on any page in dark theme", async ({
    page,
    routes,
  }) => {
    const violations: string[] = [];
    await page.emulateMedia({ colorScheme: "dark" });

    for (const route of routes) {
      await test.step(route, async () => {
        const results = await auditRoute(page, route, WCAG_TAGS);
        // Prove the dark palette is actually applied, otherwise this run would
        // silently duplicate the light one and contrast checks would mean nothing.
        await expect(page.locator("html")).toHaveAttribute(
          "data-theme",
          "dark",
        );
        violations.push(...describeViolations(route, results.violations));
      });
    }

    expect(
      violations,
      `${violations.length} WCAG violation(s) in dark theme`,
    ).toEqual([]);
  });

  test("no axe best-practice violations on any page", async ({
    page,
    routes,
  }) => {
    const violations: string[] = [];

    for (const route of routes) {
      await test.step(route, async () => {
        const results = await auditRoute(page, route, ["best-practice"]);
        violations.push(...describeViolations(route, results.violations));
      });
    }

    expect(
      violations,
      `${violations.length} best-practice violation(s)`,
    ).toEqual([]);
  });

  test("every page has a usable document structure", async ({
    page,
    routes,
  }) => {
    const problems: string[] = [];

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route, { waitUntil: "load" });

        const structure = await page.evaluate(() => {
          const headings = Array.from(
            document.querySelectorAll("h1, h2, h3, h4, h5, h6"),
          ).map((h) => ({
            level: Number(h.tagName[1]),
            text: (h.textContent ?? "").trim().slice(0, 60),
          }));
          const ids = Array.from(document.querySelectorAll("[id]")).map(
            (el) => el.id,
          );
          const duplicates = [
            ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
          ];
          return {
            lang: document.documentElement.getAttribute("lang") ?? "",
            title: document.title.trim(),
            // role="main" counts as a main landmark too, so catch both spellings.
            mainLandmarks: document.querySelectorAll("main, [role='main']")
              .length,
            lightboxes: document.querySelectorAll("#image-lightbox").length,
            headings,
            duplicates,
          };
        });

        const where = routeKey(route);

        if (!structure.lang)
          problems.push(`${where}: <html> has no lang attribute`);
        if (!structure.title)
          problems.push(`${where}: document has an empty title`);
        if (structure.mainLandmarks !== 1)
          problems.push(
            `${where}: expected exactly one main landmark (main or role="main"), found ${structure.mainLandmarks}`,
          );
        if (structure.duplicates.length)
          problems.push(
            `${where}: duplicate ids ${structure.duplicates.join(", ")}`,
          );
        if (structure.lightboxes > 1)
          problems.push(
            `${where}: ${structure.lightboxes} elements share the id "image-lightbox" - the component hardcodes it`,
          );

        const h1s = structure.headings.filter((h) => h.level === 1);
        if (h1s.length !== 1) {
          problems.push(
            `${where}: expected exactly one <h1>, found ${h1s.length}` +
              (h1s.length
                ? ` (${h1s.map((h) => `"${h.text}"`).join(", ")})`
                : ""),
          );
        }
        if (h1s.length === 1 && h1s[0].text.length < 3)
          problems.push(
            `${where}: <h1> text "${h1s[0].text}" is not descriptive`,
          );

        for (let i = 1; i < structure.headings.length; i += 1) {
          const previous = structure.headings[i - 1];
          const current = structure.headings[i];
          if (current.level - previous.level > MAX_HEADING_STEP) {
            problems.push(
              `${where}: heading level jumps h${previous.level} "${previous.text}" -> h${current.level} "${current.text}"`,
            );
          }
        }
      });
    }

    expect(problems, `${problems.length} structural problem(s)`).toEqual([]);
  });

  test("the skip link is hidden until focused, then jumps to the main landmark", async ({
    page,
    routes,
  }) => {
    const problems: string[] = [];

    for (const route of routes) {
      await test.step(route, async () => {
        await page.goto(route, { waitUntil: "load" });
        const where = routeKey(route);

        const skipLink = page.locator("a.skip-link");
        if ((await skipLink.count()) !== 1) {
          problems.push(
            `${where}: expected exactly one skip link, found ${await skipLink.count()}`,
          );
          return;
        }

        // Off-screen at rest, but still in the tab order.
        const atRest = await skipLink.boundingBox();
        if (atRest && atRest.y >= 0)
          problems.push(
            `${where}: skip link is visible before focus (y=${atRest.y})`,
          );

        // The skip link is first in the DOM, so one Tab from the document start must reach it.
        await page.keyboard.press("Tab");
        if (!(await skipLink.evaluate((el) => el === document.activeElement))) {
          problems.push(`${where}: first Tab does not land on the skip link`);
          return;
        }

        // It slides in on a CSS transition, so poll instead of sampling frame one.
        try {
          await expect
            .poll(async () => (await skipLink.boundingBox())?.y ?? -10_000, {
              timeout: 5_000,
              message: "the skip link should slide into view once focused",
            })
            .toBeGreaterThanOrEqual(0);
        } catch {
          problems.push(`${where}: skip link stays off-screen while focused`);
        }

        if ((await page.locator("#main-content").count()) !== 1) {
          problems.push(
            `${where}: skip link targets #main-content, which does not exist`,
          );
          return;
        }

        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/#main-content$/);
      });
    }

    expect(problems, `${problems.length} skip-link problem(s)`).toEqual([]);
  });
});
