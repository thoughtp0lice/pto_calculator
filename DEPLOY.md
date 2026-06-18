# Deployment

This project is a static Vite build (output: `dist/`). You can host it anywhere that serves static files. Two easy options are documented below — pick whichever you prefer.

## Build basics

- `npm run build` produces a fully-static site in `dist/`.
- The site uses `BASE_PATH` (read in `vite.config.js`) to set Vite's `base`.
  - **Default (unset):** site is served from `/` — right for Cloudflare Pages, Netlify, custom domains, local preview.
  - **GitHub Pages:** must be set to `/<repo-name>/` so asset URLs resolve correctly. The included workflow does this automatically.

## Option A — GitHub Pages

A workflow is already configured at `.github/workflows/deploy.yml`. It builds and publishes on every push to `main`.

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Push to `main` (or run the workflow manually from the Actions tab via "Run workflow").
5. After the workflow completes, your site is live at:

   ```
   https://<your-username>.github.io/<repo-name>/
   ```

The workflow sets `BASE_PATH=/<repo-name>/` at build time, so paths just work. If you later attach a custom apex/subdomain to Pages, change `BASE_PATH` to `/` in the workflow.

## Option B — Cloudflare Pages

Cloudflare Pages serves from the root of the assigned hostname, so no `BASE_PATH` is needed.

### Via the dashboard (recommended)

1. Push this repo to GitHub (or GitLab).
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git**.
3. Authorize and select this repo.
4. Configure the build:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20 (set `NODE_VERSION=20` under environment variables if needed)
5. Save and deploy. Cloudflare will build on every push to `main` and publish to `https://<project>.pages.dev`.

### Via Wrangler (one-off / CI)

```bash
npm install -D wrangler
npm run build
npx wrangler pages deploy dist --project-name pto-calculator
```

You'll be prompted to log in the first time.

## Local preview of the production build

```bash
npm run build
npm run preview
```

Useful for sanity-checking before pushing a deploy.

## Choosing between the two

- **GitHub Pages** is zero-config if your code already lives on GitHub and you're fine with a `github.io` URL. The included workflow is ready to go.
- **Cloudflare Pages** is a better fit if you want a custom domain, faster global edge cache, or built-in preview deployments for every branch/PR.

You don't need both. If you go with Cloudflare Pages, you can delete `.github/workflows/deploy.yml` and revert `vite.config.js` to a plain `base: '/'`.
