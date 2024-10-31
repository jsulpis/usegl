import { test, expect } from "@playwright/test";

import { routes } from "../playground/src/components/routes";

for (const route of routes) {
	test(route, async ({ page }) => {
		await page.goto(`http://localhost:4321/${route}`);

		await expect(page.locator("main")).toHaveScreenshot();
	});
}

test("pointer move", async ({ page, viewport }) => {
	await page.goto(`http://localhost:4321/pointer`);

	await expect(page.getByText("Renders: 1")).toBeVisible();

	await page.mouse.move((viewport?.width || 0) * 0.5, (viewport?.height || 0) * 0.45);

	await expect(page.getByText("Renders: 2")).toBeVisible();
	await page.waitForTimeout(200);

	await expect(page.locator("main")).toHaveScreenshot();
});
