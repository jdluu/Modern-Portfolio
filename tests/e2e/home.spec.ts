import { test, expect } from "@playwright/test";

test("homepage has correct title and accessible navigation", async ({
  page,
}) => {
  await page.goto("/");

  // Check title regex to be flexible but ensure "Jeffrey Luu" is there
  await expect(page).toHaveTitle(/Jeffrey Luu/);

  // Check main navigation exists
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
});

test("desktop navigation links are visible", async ({ page, isMobile }) => {
  if (isMobile) return;
  await page.goto("/");
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Work" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
});

test("mobile menu toggles correctly", async ({ page, isMobile }) => {
  // Only run on mobile
  if (!isMobile) return;

  await page.goto("/");

  const menuButton = page.getByRole("button", { name: "Toggle menu" });
  await expect(menuButton).toBeVisible();

  // Open menu
  await menuButton.click();
  const menu = page.getByRole("dialog", { name: "Main menu panel" });
  await expect(menu).toBeVisible();
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();

  // Close menu
  const closeButton = page.getByRole("button", { name: "Close menu" });
  await closeButton.click();
  await expect(menu).toBeHidden();
});
