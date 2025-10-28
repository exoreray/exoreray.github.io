# Deployment Guide

## Deploy to GitHub Pages

To publish the website to https://exoreray.github.io, run:

```bash
npm run deploy
```

This command will:
1. Build the production version (`npm run build`)
2. Deploy the `build/` folder to the `gh-pages` branch
3. Make the site live at https://exoreray.github.io

## Manual Build Only

To just build without deploying:

```bash
npm run build
```

## Development Server

To run locally:

```bash
npm start
```

---

**Note:** The `npm run deploy` command is the standard way to publish changes to the live site.
