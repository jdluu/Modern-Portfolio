import type { Page } from "@playwright/test";
import { expect, test } from "./helpers/fixtures";
import { settleDom, settleScroll } from "./helpers/site";

/**
 * Behaviour of the project case-study table of contents.
 *
 * This is the only page type with a TOC, and the control is driven by JS, so the
 * coverage belongs here rather than in the unit suite: every defect it has had
 * was a page-lifecycle or layout problem, which a stubbed DOM cannot observe.
 */
const PROJECT = "/projects/zooseeker/";

function toc(page: Page) {
  return page.locator(".project-toc");
}

function isCollapsed(page: Page) {
  return toc(page).evaluate((el) => el.classList.contains("toc-collapsed"));
}

/**
 * Wait for the controller, then reveal the list.
 *
 * The container is marked before the rest of init runs, but all of it executes in
 * one task, so observing the mark means the default collapsed state is already
 * applied. Reading the state before that would race the default and then toggle
 * the wrong way.
 */
async function waitForToc(page: Page) {
  await expect(toc(page)).toHaveAttribute("data-toc-init", "1");
}

/** The TOC starts collapsed on small viewports, so make the list reachable. */
async function expandToc(page: Page) {
  await waitForToc(page);
  if (await isCollapsed(page)) {
    await page.locator("#toc-toggle").click();
    await expect(toc(page)).not.toHaveClass(/toc-collapsed/);
  }
  await expect(page.locator(".toc-list a").first()).toBeVisible();
}

test.describe("project table of contents", () => {
  test("is initialised after client-side navigation", async ({ page }) => {
    // Arriving by clicking through the site is what regressed: the controller was
    // registered on DOMContentLoaded, which ClientRouter never fires again once it
    // has swapped the document.
    await page.goto("/work", { waitUntil: "load" });
    // The grid is paginated by a hydrated island, so wait for it to stop
    // re-rendering before choosing a card: the first one in DOM order is hidden by
    // that island, and picking it early means clicking something already gone.
    await settleDom(page);
    const entry = page.locator('a[href^="/projects/"]:visible').first();
    await expect(entry).toBeVisible();
    await entry.click();
    await page.waitForURL("**/projects/**");

    await waitForToc(page);

    // The mark alone proves nothing, so drive the toggle and require a response:
    // an unattached controller leaves the button completely inert.
    const before = await isCollapsed(page);
    await page.locator("#toc-toggle").click();
    await expect.poll(() => isCollapsed(page)).toBe(!before);
  });

  test("collapses to a control that contains and keeps its toggle usable", async ({
    page,
  }) => {
    await page.goto(PROJECT, { waitUntil: "load" });
    await waitForToc(page);
    if (!(await isCollapsed(page))) {
      await page.locator("#toc-toggle").click();
    }
    await expect(toc(page)).toHaveClass(/toc-collapsed/);

    const geometry = await page.evaluate(() => {
      const wrapper = document.querySelector(".project-toc") as HTMLElement;
      const card = document.querySelector(".toc-card") as HTMLElement;
      const toggle = document.querySelector("#toc-toggle") as HTMLElement;
      const wrapperBox = wrapper.getBoundingClientRect();
      const cardBox = card.getBoundingClientRect();
      const toggleBox = toggle.getBoundingClientRect();
      return {
        wrapperOverflowsX: wrapper.scrollWidth > wrapper.clientWidth + 1,
        cardOverflowsWrapper: cardBox.right > wrapperBox.right + 1,
        toggleInsideCard:
          toggleBox.left >= cardBox.left - 1 &&
          toggleBox.right <= cardBox.right + 1,
        toggleWidth: Math.round(toggleBox.width),
        toggleHeight: Math.round(toggleBox.height),
      };
    });

    // An earlier version let the card be wider than its own wrapper and squeezed the
    // toggle to 10px wide on desktop and 16px on mobile, so the glyph was painted
    // outside a box a third of its width.
    expect(geometry.wrapperOverflowsX).toBe(false);
    expect(geometry.cardOverflowsWrapper).toBe(false);
    expect(geometry.toggleInsideCard).toBe(true);
    // WCAG 2.2 target size minimum, so the control stays hittable.
    expect(geometry.toggleWidth).toBeGreaterThanOrEqual(24);
    expect(geometry.toggleHeight).toBeGreaterThanOrEqual(24);
  });

  test("scrolls a section link clear of the navbar", async ({ page }) => {
    await page.goto(PROJECT, { waitUntil: "load" });
    await expandToc(page);
    await page.locator('.toc-list a[href="#process"]').click();
    // Wait for the scroll to finish before sampling: "heading below the navbar" is
    // also true while the page is still at the top, so a poll on that condition
    // passes before the scroll even starts.
    await settleScroll(page);

    const settled = await page.evaluate(() => {
      const nav = document.querySelector("#main-navbar");
      const heading = document.querySelector("#process h2");
      if (!nav || !heading) return null;
      return {
        scrolled: window.scrollY > 0,
        hash: location.hash,
        navBottom: Math.round(nav.getBoundingClientRect().bottom),
        headingTop: Math.round(heading.getBoundingClientRect().top),
      };
    });

    expect(
      settled,
      "the section and the navbar should both exist",
    ).not.toBeNull();
    expect(settled!.hash).toBe("#process");
    expect(settled!.scrolled).toBe(true);
    // The offset used to parseInt("4rem"), read that as 4, and land the section
    // behind the navbar, so a click hid the very section it navigated to.
    expect(settled!.headingTop).toBeGreaterThanOrEqual(settled!.navBottom!);
  });

  test("marks the section in view as the current link", async ({ page }) => {
    await page.goto(PROJECT, { waitUntil: "load" });
    await expandToc(page);

    const link = page.locator('.toc-list a[href="#process"]');
    await link.click();
    await settleScroll(page);

    await expect(link).toHaveClass(/link-active/);
    await expect(link).toHaveAttribute("aria-current", "true");
  });
});
