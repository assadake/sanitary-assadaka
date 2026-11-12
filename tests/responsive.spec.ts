import { expect, test, type Locator, type Page } from "@playwright/test";

type Language = "ar" | "en";

const screens = [
  { name: "écran pliable", width: 280, height: 653 },
  { name: "petit téléphone", width: 320, height: 568 },
  { name: "téléphone étroit", width: 360, height: 640 },
  { name: "téléphone courant", width: 390, height: 844 },
  { name: "grand téléphone", width: 430, height: 932 },
  { name: "paysage compact", width: 568, height: 320 },
  { name: "paysage", width: 640, height: 360 },
  { name: "tablette", width: 768, height: 1024 },
];

async function setLanguage(page: Page, lang: Language) {
  await page.addInitScript((value) => {
    try { localStorage.setItem("assadaka.lang", JSON.stringify(value)); } catch { /* iframe without storage */ }
  }, lang);
}

async function expectNoPageOverflow(page: Page, expectedWidth: number) {
  const sizes = await page.evaluate(() => ({
    viewport: window.innerWidth,
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(sizes.viewport).toBe(expectedWidth);
  expect(sizes.client).toBe(expectedWidth);
  expect(sizes.scroll).toBeLessThanOrEqual(expectedWidth + 1);
}

async function expectHorizontallyVisible(locator: Locator, page: Page) {
  await expect(locator).toBeVisible();
  const rect = await locator.boundingBox();
  expect(rect).not.toBeNull();
  expect(rect!.x).toBeGreaterThanOrEqual(-1);
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(page.viewportSize()!.width + 1);
}

test.beforeEach(async ({ page }) => {
  // The layout must also work when external fonts, photos or the viewer CDN
  // cannot be reached. Local panoramas and all application code still load.
  await page.route("https://**/*", (route) => route.abort());
});

test.describe("mobile layouts in both directions", () => {
  test.use({ isMobile: true, hasTouch: true });

  for (const lang of ["ar", "en"] as const) {
    for (const screen of screens) {
      test(`${screen.name} ${screen.width}×${screen.height} — ${lang}`, async ({ page }) => {
        await page.setViewportSize({ width: screen.width, height: screen.height });
        await setLanguage(page, lang);
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
        await expectNoPageOverflow(page, screen.width);
        await expectHorizontallyVisible(page.locator('button[aria-controls="mobile-menu"]'), page);
        await expectHorizontallyVisible(page.locator('header#top button[aria-label^="' + (lang === "ar" ? "قائمة الطلب" : "Enquiry list") + '"]'), page);

        // The brand names in the hero statistics must not be cut off by their grid cells.
        const overflowingStats = await page.locator("main dl").first().locator("dt").evaluateAll((items) =>
          items.filter((item) => item.scrollWidth > item.clientWidth + 1).map((item) => item.textContent),
        );
        expect(overflowingStats).toEqual([]);

        await page.goto("/visite", { waitUntil: "domcontentloaded" });
        await expect(page.locator(".visite-topbar")).toBeVisible();
        await expectNoPageOverflow(page, screen.width);
        await expectHorizontallyVisible(page.locator(".visite-lang"), page);
        const themeTrigger = page.locator(".theme-controls--visite .theme-trigger");
        await expectHorizontallyVisible(themeTrigger, page);
        await themeTrigger.click();
        await expectHorizontallyVisible(page.locator(".theme-controls--visite .theme-popover"), page);
        await themeTrigger.click();

        const viewer = page.frameLocator(".visite-iframe");
        await expect(viewer.locator("#thumbs button")).toHaveCount(8);
        const viewerLayout = await viewer.locator("body").evaluate(() => {
          const rect = (id: string) => document.getElementById(id)!.getBoundingClientRect().toJSON();
          return {
            width: window.innerWidth,
            height: window.innerHeight,
            panorama: rect("panorama"),
            topbar: rect("topbar"),
            arrows: rect("arrows"),
            caption: rect("caption"),
            status: rect("status"),
            thumbs: rect("thumbs"),
            controls: Array.from(document.querySelectorAll("#v-controls button"), (button) => button.getBoundingClientRect().toJSON()),
          };
        });
        expect(Math.abs(viewerLayout.panorama.height - viewerLayout.height)).toBeLessThanOrEqual(1);
        expect(viewerLayout.topbar.bottom).toBeLessThanOrEqual(viewerLayout.arrows.top + 1);
        expect(viewerLayout.arrows.bottom).toBeLessThanOrEqual(viewerLayout.caption.top + 1);
        expect(viewerLayout.caption.bottom).toBeLessThanOrEqual(viewerLayout.status.top + 1);
        expect(viewerLayout.status.bottom).toBeLessThanOrEqual(viewerLayout.thumbs.top + 1);
        for (const control of viewerLayout.controls) {
          expect(control.left).toBeGreaterThanOrEqual(-1);
          expect(control.right).toBeLessThanOrEqual(viewerLayout.width + 1);
        }

        await page.goto("/#/showroom", { waitUntil: "domcontentloaded" });
        await expect(page.locator(".tour-frame")).toBeVisible();
        await expectNoPageOverflow(page, screen.width);
        const tourTheme = page.locator(".tour-header .theme-trigger");
        const tourLanguage = page.locator(".tour-header button[aria-expanded]").first();
        await expectHorizontallyVisible(tourTheme, page);
        await expectHorizontallyVisible(tourLanguage, page);
        await tourTheme.click();
        await expectHorizontallyVisible(page.locator(".tour-header .theme-popover"), page);
        await tourTheme.click();
        await tourLanguage.click();
        await expectHorizontallyVisible(page.locator(".tour-header .lang-switch-popover"), page);
        const tourLayout = await page.locator(".tour-frame").evaluate((frame) => {
          const rect = (selector: string) => frame.querySelector(selector)!.getBoundingClientRect().toJSON();
          return { frame: frame.getBoundingClientRect().toJSON(), actions: rect(".tour-viewer-actions"), caption: rect(".tour-caption"), controls: rect(".tour-controls") };
        });
        expect(tourLayout.actions.left).toBeGreaterThanOrEqual(tourLayout.frame.left - 1);
        expect(tourLayout.actions.right).toBeLessThanOrEqual(tourLayout.frame.right + 1);
        expect(tourLayout.actions.bottom).toBeLessThanOrEqual(tourLayout.caption.top + 1);
        expect(tourLayout.caption.bottom).toBeLessThanOrEqual(tourLayout.controls.top + 1);
      });
    }
  }
});

test.describe("mobile interactions", () => {
  test.use({ isMobile: true, hasTouch: true });

  for (const screen of [{ width: 320, height: 568 }, { width: 568, height: 320 }, { width: 768, height: 1024 }]) {
    test(`menu, theme and language remain usable at ${screen.width}×${screen.height}`, async ({ page }) => {
      await page.setViewportSize(screen);
      await setLanguage(page, "en");
      await page.goto("/");
      await page.locator('button[aria-controls="mobile-menu"]').click();
      const menu = page.locator("#mobile-menu");
      const trigger = menu.locator(".theme-trigger");
      await trigger.scrollIntoViewIfNeeded();
      await trigger.click();
      const sage = menu.getByRole("button", { name: "Sage green" });
      await sage.scrollIntoViewIfNeeded();
      await expectHorizontallyVisible(sage, page);
      await sage.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "sauge");
      const dark = menu.getByRole("button", { name: "Dark", exact: true });
      await dark.scrollIntoViewIfNeeded();
      await dark.click();
      await expect(page.locator("html")).toHaveAttribute("data-mode", "dark");

      // Closing the inline palette must not move the language control before
      // its click is delivered (especially on touch screens).
      const language = menu.getByRole("button", { name: "Language & region" });
      await language.scrollIntoViewIfNeeded();
      await language.click();
      await expect(language).toHaveAttribute("aria-expanded", "true");
      const arabic = menu.locator(".lang-switch-popover button").first();
      await arabic.scrollIntoViewIfNeeded();
      await arabic.click();
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expectNoPageOverflow(page, screen.width);
    });

    test(`product details and enquiry form scroll at ${screen.width}×${screen.height}`, async ({ page }) => {
      await page.setViewportSize(screen);
      await setLanguage(page, "en");
      await page.goto("/");
      const product = page.locator("#catalog article").first();
      const quick = product.locator(".product-quick");
      await quick.scrollIntoViewIfNeeded();
      await expect(quick).toBeVisible();
      await quick.click();
      const details = page.locator('.mobile-sheet[role="dialog"]');
      await expect(details).toBeVisible();
      if (screen.height < 500) {
        const title = await details.locator("h3").boundingBox();
        expect(title!.y + title!.height).toBeLessThanOrEqual(screen.height + 1);
      }
      const floatingButtonIsOnTop = await page.evaluate(() => {
        const floating = document.querySelector(".float-actions a")!;
        const rect = floating.getBoundingClientRect();
        return Boolean(document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest(".float-actions"));
      });
      expect(floatingButtonIsOnTop).toBe(false);
      const add = details.getByRole("button", { name: "Add to enquiry" });
      await add.scrollIntoViewIfNeeded();
      await add.click();
      await page.locator('header#top button[aria-label^="Enquiry list"]').click();
      const cart = page.locator(".cart-drawer");
      const name = cart.getByLabel("Full name");
      await name.scrollIntoViewIfNeeded();
      await name.fill("Test");
      expect(await name.evaluate((input) => parseFloat(getComputedStyle(input).fontSize))).toBeGreaterThanOrEqual(16);
      const checkout = cart.getByRole("button", { name: "Send enquiry on WhatsApp" });
      await checkout.scrollIntoViewIfNeeded();
      await expectHorizontallyVisible(checkout, page);
      const box = await checkout.boundingBox();
      expect(box!.y).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height).toBeLessThanOrEqual(screen.height + 1);
      await expect(page.locator(".toast-position > div")).toHaveCount(0);
    });
  }

  test("the embedded tour can enter and exit fullscreen on touch screens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setLanguage(page, "en");
    await page.goto("/visite");
    const iframe = page.locator(".visite-iframe");
    const viewer = page.frameLocator(".visite-iframe");
    await page.locator(".visite-btn--ghost").click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName)).toBe("IFRAME");
    await viewer.locator("#btn-fs").click();
    await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBe(null);

    await viewer.locator("#btn-fs").click();
    await expect.poll(() => viewer.locator("html").evaluate(() => document.fullscreenElement?.tagName)).toBe("HTML");
    await viewer.locator("#btn-fs").click();
    await expect.poll(() => viewer.locator("html").evaluate(() => document.fullscreenElement)).toBe(null);

    // On browsers without the native API, the page uses a closable CSS overlay.
    await iframe.evaluate((element) => Object.defineProperty(element, "requestFullscreen", { value: undefined }));
    await page.locator(".visite-btn--ghost").click();
    await expect(page.locator(".visite-frame")).toHaveClass(/is-fs/);
    await viewer.locator("#btn-fs").click();
    await expect(page.locator(".visite-frame")).not.toHaveClass(/is-fs/);
  });

  test("the simplified 360° view does not show misplaced hotspots", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await setLanguage(page, "en");
    await page.addInitScript(() => {
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", { value: () => null });
    });
    await page.goto("/#/showroom");
    await expect(page.getByRole("status").filter({ hasText: "Simplified view" })).toBeVisible();
    const hotspots = page.locator(".tour-hs");
    await expect.poll(() => hotspots.evaluateAll((items) =>
      items.filter((item) => getComputedStyle(item).opacity !== "0").length,
    )).toBe(0);
    await page.locator(".tour-controls").getByRole("button", { name: "Next stop" }).click();
    await expect(page.locator(".tour-caption h2")).toHaveText("Marble & basin corner");
  });

  test("the guide dialog stays scrollable on a short landscape screen", async ({ page }) => {
    await page.setViewportSize({ width: 568, height: 320 });
    await setLanguage(page, "en");
    await page.goto("/");
    await page.locator("#stories .snap-x-mand button").first().click();
    const dialog = page.locator('#stories .mobile-sheet[role="dialog"]');
    await expect(dialog).toBeVisible();
    const contact = dialog.getByRole("link", { name: "Discuss with us on WhatsApp" });
    await contact.scrollIntoViewIfNeeded();
    await expectHorizontallyVisible(contact, page);
    const box = await contact.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(321);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
  });
});

test.describe("desktop breakpoints", () => {
  for (const width of [1024, 1280, 1440, 1536]) {
    test(`header fits at ${width}px in English`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await setLanguage(page, "en");
      await page.goto("/");
      await expectNoPageOverflow(page, width);
      await expectHorizontallyVisible(page.locator('header#top a.accent-outline[href="/visite"]'), page);
      await expectHorizontallyVisible(page.locator('header#top button[aria-label^="Enquiry list"]'), page);
    });
  }
});
