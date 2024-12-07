import { test, expect } from "@playwright/test";

import { routes } from "../playground/src/components/routes";

const ignoreRoutes = new Set(["pause", "dataTexture"]);

const routesToTest = routes.filter(({ route }) => !ignoreRoutes.has(route));

for (const { section, route } of routesToTest) {
  test(route, async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/${section}/${route}`);

    await expect(page.getByText("Renders: 1")).toBeVisible();
    await expect(page.locator("main")).toHaveScreenshot();
  });
}

test("pointer move", async ({ page, viewport, baseURL }) => {
  await page.goto(`${baseURL}/pointer/pointer`);

  await expect(page.getByText("Renders: 1")).toBeVisible();

  await page.mouse.move((viewport?.width || 0) * 0.5, (viewport?.height || 0) * 0.45);

  await expect(page.getByText("Renders: 2")).toBeVisible();

  await page.mouse.down();

  await page.waitForTimeout(100);

  await expect(page.locator("main")).toHaveScreenshot();
});

test("play / pause controls - local", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/core/pause`);

  await expect(page.getByText("Renders: 1")).toBeVisible();

  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const playPauseBtn = document.querySelector<HTMLButtonElement>(
        ".controls.local button:nth-of-type(1)",
      )!;

      playPauseBtn.click();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              playPauseBtn.click();
              resolve();
            });
          });
        });
      });
    });
  });

  await expect(page.getByText("Renders: 5")).toBeVisible();

  await expect(page.locator("main")).toHaveScreenshot();
});

test("play / pause controls - global", async ({ page, baseURL }) => {
  await page.goto(`${baseURL}/core/pause`);

  await expect(page.getByText("Renders: 1")).toBeVisible();

  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      const playPauseBtn = document.querySelector<HTMLButtonElement>(".controls.global button")!;

      playPauseBtn.click();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              playPauseBtn.click();
              resolve();
            });
          });
        });
      });
    });
  });

  await expect(page.getByText("Renders: 5")).toBeVisible();

  await expect(page.locator("main")).toHaveScreenshot();
});
