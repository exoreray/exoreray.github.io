// End-to-end tests for the portfolio. They run against the production build
// (`npm run build`), so what is tested is exactly what `npm run deploy` ships.
//
//   npm run test:e2e          run the suite (builds must already exist)
//   npm run test:e2e:report   open the HTML report of the last run
//
// First time on a new machine: `npx playwright install chromium`.
const { defineConfig } = require('@playwright/test');

const PORT = 4173;
// Set this to verify the exact same suite against a published deployment.
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  // Bound simultaneous animation / software-rendering work on developer and CI hosts.
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: externalBaseURL || `http://localhost:${PORT}`,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: {
      // Most specs check layout and navigation, which don't depend on the 3D
      // scenes. Rendering them in software (CI machines have no GPU) is slow
      // enough to stall the page, so WebGL is off unless a spec turns it on.
      // This also continuously tests that the site works without WebGL.
      args: ['--disable-webgl', '--disable-3d-apis'],
    },
  },
  webServer: externalBaseURL ? undefined : {
    command: `npx serve -s build -l ${PORT} --no-clipboard`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
