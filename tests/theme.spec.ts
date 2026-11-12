import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://**/*", (route) => route.abort());
  await page.addInitScript(() => {
    try { localStorage.setItem("assadaka.lang", JSON.stringify("en")); } catch { /* storage may be unavailable */ }
  });
});

test("ceramic blue in light mode is the default, including invalid stored values", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "ceramique");
  await expect(html).toHaveAttribute("data-mode", "light");
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#1f5d7a");
  expect(await html.evaluate((root) => root.style.getPropertyValue("--color-ikea"))).toBe("#1f5d7a");
  await page.goto("/visite");
  expect(await page.locator(".visite-btn--gold").evaluate((button) => getComputedStyle(button).color)).toBe("rgb(255, 255, 255)");

  await page.evaluate(() => {
    localStorage.setItem("assadaka.theme", "unknown");
    localStorage.setItem("assadaka.mode", "unknown");
  });
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "ceramique");
  await expect(html).toHaveAttribute("data-mode", "light");
});

test("saved preferences survive navigation and the embedded viewer follows the palette", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.setItem("assadaka.theme", "terre");
    localStorage.setItem("assadaka.mode", "dark");
  });
  await page.goto("/visite");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "terre");
  await expect(html).toHaveAttribute("data-mode", "dark");
  const frame = page.frameLocator(".visite-iframe");
  await expect(frame.locator("#thumbs button")).toHaveCount(8);
  await expect.poll(() => frame.locator("html").evaluate((root) => root.style.getPropertyValue("--viewer-accent"))).toBe("#d59a7b");

  await page.locator(".theme-controls--visite .theme-trigger").click();
  await page.getByRole("button", { name: "Sage green" }).click();
  await page.getByRole("button", { name: "Light", exact: true }).click();
  await expect(html).toHaveAttribute("data-theme", "sauge");
  await expect(html).toHaveAttribute("data-mode", "light");
  await expect.poll(() => frame.locator("html").evaluate((root) => root.style.getPropertyValue("--viewer-accent"))).toBe("#8fbd9d");

  // All eight thumbnails remain reachable and update the selected scene.
  const lastThumb = frame.locator("#thumbs button").last();
  await lastThumb.click();
  await expect(lastThumb).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".visite-card").last()).toHaveClass(/is-active/);

  await page.goto("/#/showroom");
  await expect(html).toHaveAttribute("data-theme", "sauge");
  await expect(html).toHaveAttribute("data-mode", "light");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "sauge");
  await expect(html).toHaveAttribute("data-mode", "light");
});

test("the appearance picker remains usable in landscape", async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto("/visite");
  await page.locator(".theme-controls--visite .theme-trigger").click();
  const dark = page.locator(".theme-controls--visite .theme-popover").getByRole("button", { name: "Dark", exact: true });
  await dark.scrollIntoViewIfNeeded();
  await dark.click();
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");
});

test("defaults still work if browser storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get: () => { throw new Error("storage unavailable"); } });
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "ceramique");
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light");
});
