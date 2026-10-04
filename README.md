# Ray Xi's portfolio

Live site: https://exoreray.github.io

```bash
npm ci --legacy-peer-deps
npx playwright install chromium
npm start
```

`npm run test:unit` checks the interaction and deployment helpers.
`npm run build && npm run test:e2e` checks the production build in Chromium,
including the default design and `?view=original`.

See [.claude/DEPLOYMENT.md](.claude/DEPLOYMENT.md) before publishing.
