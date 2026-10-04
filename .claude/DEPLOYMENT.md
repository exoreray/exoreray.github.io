# Deployment Guide

Production is https://exoreray.github.io, served by GitHub Pages from `gh-pages:/`.
The source repository is `exoreray/exoreray.github.io`, branch `master`, using the
`exoreray` GitHub identity. `exoreray.com` redirects to this site.

## Source and setup

The default application is `src/PreviewApp.js` → `RainStudy`; `?view=original`
opens the earlier design. Both use hash routes. Keep both versions covered by
the browser suite. Do not replace the default application with the older one.

The September 2026 production source was recovered into Git in October 2026.
The prior remote master did not contain that source. Always start from a freshly
fetched source branch; do not publish an old checkout just because it builds.

```bash
npm ci --legacy-peer-deps
npx playwright install chromium
```

## Verify and publish

Review and commit the source changes, confirm the GitHub identity and remote,
and push the source before publishing. Source and `gh-pages` are separate commits.
Never commit `build/`, browser reports, or local session artifacts.

```bash
npm run deploy
```

This runs the unit/publisher tests, builds production, runs the end-to-end suite
against that build, then publishes it with `scripts/publish.cjs`. The publisher
retains the previous release's hashed JS/CSS so cached tabs can finish loading.
Do not replace it with a bare `gh-pages -d build` command.

For verification without publishing:

```bash
npm run test:unit
npm run build
npm run test:e2e
npm run test:e2e:report
```

After publishing, confirm the Pages deployment succeeds, compare the live asset
manifest against the build, and exercise the live default and original routes.
Record both the source commit and the successful Pages deployment commit/ID.
The workflow checks every source push and pull request; a push alone does not
mean the website has been deployed.

To run the browser suite against the live site instead of the local server:

```bash
PLAYWRIGHT_BASE_URL=https://exoreray.github.io npm run test:e2e
```

`npm start` runs the development server. Browser emulation does not establish
that a physical iPhone or an app-to-browser handoff has been tested.
