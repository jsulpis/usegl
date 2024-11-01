import { defineConfig, devices } from "@playwright/test";

const desktopViewport = { width: 800, height: 400 };
const mobileViewport = { width: 360, height: 640 };

const serverUrl = "http://localhost:4321";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
	testDir: "./tests",
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !!process.env.CI,
	retries: 3,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: "html",
	use: {
		trace: "on-first-retry",
		baseURL: serverUrl,
	},
	snapshotPathTemplate: "{testDir}/__screenshots__/{testName}/{testName}-{projectName}{ext}",
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.02,
		},
	},
	projects: [
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				viewport: desktopViewport,
				launchOptions: {
					args: ["--use-angle=gl"],
				},
			},
		},
		{
			name: "firefox",
			use: {
				...devices["Desktop Firefox"],
				viewport: desktopViewport,
				launchOptions: {
					headless: false,
				},
			},
			grepInvert: /play \/ pause controls/, // Flaky on firefox, and there is no fancy API in the play/pause controls, so the other browsers are enough
		},
		{
			name: "safari",
			use: { ...devices["Desktop Safari"], viewport: desktopViewport },
		},
		{
			name: "android",
			use: {
				...devices["Pixel 5"],
				viewport: mobileViewport,
				launchOptions: {
					args: ["--use-gl=egl", "--ignore-gpu-blocklist", "--use-gl=angle"],
				},
			},
		},
		{
			name: "iphone",
			use: { ...devices["iPhone 12"], viewport: mobileViewport },
		},
	],
	webServer: {
		command: "pnpm dev",
		url: serverUrl,
		reuseExistingServer: !process.env.CI,
	},
});
