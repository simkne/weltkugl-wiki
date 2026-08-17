# Handoff — weltkugl.net wiki (Docus)

Date: 2026-08-18

Handoff for continuing work on the Docus wiki at `https://weltkugl.net/docus/`.

## Project state at handoff

- **Production build**: works. `NUXT_SITE_URL=https://weltkugl.net pnpm build`
- **Dev server**: works on `http://localhost:3000/docus/` (fallback port 3001/3002 if 3000 is taken). Requires the Vite plugin workaround in `nuxt.config.ts` (see below).
- **Git**: repo exists but has **no commits yet**. Everything is staged (`A`) or untracked (`??`). First commit is still pending.
- **Deployment**: designed but NOT yet run. GitHub Actions workflow + pm2 config + Apache proxy are written and in the repo.

## Key facts to preserve

### Subfolder deployment (`/docus/`)

- `nuxt.config.ts` sets `app.baseURL: '/docus/'`.
- `site.url` must be **domain-only** (`https://weltkugl.net`) — nuxt-site-config rejects path values. The base path comes from `app.baseURL`.
- `llms.domain` **does** include the path: `https://weltkugl.net/docus`.
- `robots.robotsTxt: false` — robots.txt must live at the domain root, so it's added manually on the server, not generated under `/docus/`.
- `NUXT_SITE_URL` env at build time = `https://weltkugl.net` (domain only).

### Sitemap — OPEN ISSUE (not fixed)

**Problem**: Docus's built-in sitemap generates absolute URLs **without** the `/docus/` prefix. This is cosmetic (crawlers follow relative paths fine) but means `https://weltkugl.net/hosting/...` etc. which 404 on the live site.

**Tried**: custom `server/routes/sitemap.xml.ts` override copying Docus's handler + prepending `baseURL`. It was never picked up at runtime (Docus's built-in route won), and it broke `pnpm dev` with `Cannot find package '@nuxt/content'`. **The file was deleted.** Do not recreate it without first confirming route-precedence works.

**Status**: deferred. Options for later: (a) accept the cosmetic issue, (b) nuxi/nuxt-content `sitemap` module route override via a Nitro plugin hook instead of a route file, (c) patch via `site.url` + robots config if a future Docus version supports it.

### The `hmrClient` bug — FIXED, do not remove the workaround

- **Symptom**: dev console error `Uncaught ReferenceError: Cannot access 'hmrClient' before initialization` at `createHotContext` → breaks ALL client JS (no sidebar, no search, dead mobile menu).
- **Root cause**: Nuxt 4.5.2 framework bug. `@vite/client` imports `nuxt/app/compat/interval.js` → imports the diagnostics chain → `nostics` dev reporter calls `createHotContext()` at module top-level before `client.mjs` has initialized `hmrClient`. Circular-import dead zone.
- **Fix**: Vite plugin `strip-nostics-dev-hmr-hookup` in `nuxt.config.ts`. It replaces `import.meta.hot` with `undefined` in the nostics dev reporter module, so Vite's import-analysis skips injecting the top-level `createHotContext()` call. The reporter is best-effort only and no-ops gracefully.
- **Do NOT**: remove `optimizeDeps.exclude` hack (it did nothing) — actually reverted, not present. Do NOT pin Nuxt ≤ 4.4.8 to "fix" this: that regresses to Vite 7/Rollup which fails the build on `node-mock-http`'s minified file (`Identifier "h" has already been declared` in `nodeless.mjs`). Stay on Nuxt 4.5.2 + Vite 8 (Rolldown).
- **DO NOT regenerate `pnpm-lock.yaml`** casually. Deleting it and reinstalling drifts Vite 8 → Vite 7/Rollup and breaks builds. If deps must change, use `pnpm add`/`pnpm update` which keep the lockfile's Vite 8 resolution.

### Versions that work (current, verified)

- nuxt `4.5.2` (Vite 8.2.1 / Rolldown) — installed & lockfile-pinned
- docus `^5.12.3` (never bump to 7.x — doesn't exist)
- `package.json` declares `"nuxt": "^4.5.2"`

## Content

- `content/index.md` — landing page (rewritten for the wiki concept).
- `content/1.hosting/1.deploy-first-node-app-to-netcup.md` — full deployment guide used as the reference article.
- `content/2.projects/1.iot/` — IoT knowledge base migrated from `astrovite/src/content/iot/`:
  - `1.overview.md` → `/projects/iot/overview`
  - `2.esp32/1.getting-started.md` → `/projects/iot/esp32/getting-started`
  - `3.openhab/1.overview.md`, `2.openhabian-maintenance.md`
  - `3.openhab/3.device-monitoring/{1.minimal,2.flexible,3.integrate-existing}-device-monitoring.md`
  - `4.sensors/1.overview.md`
- All routes verified returning 200 in production preview.

## Deployment pipeline (ready, untested in production)

- `.github/workflows/deploy.yml` — build (`ubuntu-latest`), backup, rsync `.output/`, pm2 restart. Install/build correctly use `pnpm install --frozen-lockfile` + `pnpm build`; the `npm install --omit=dev --prefix .output/server` step is the standard Nitro prod-deps install (correct, not a mistake).
- `ecosystem.config.cjs` — app `docus-wiki`, cwd `/var/www/weltkugl.net/docus`, `HOST=127.0.0.1`, `PORT=3001`.
- Apache reverse-proxies `/docus/` → `127.0.0.1:3001` (`mod_proxy`). Guide documents the exact config.
- GitHub Secrets required: `SSH_HOST`, `SSH_USERNAME`, `SSH_PRIVATE_KEY`, `DEPLOY_PATH` (`/var/www/weltkugl.net/docus`).

## Also in repo

- `public/welkugl_logo.png` — untracked, byte-identical to `favicon.ico`. Decision pending: use as logo/branding or remove.
- `AGENTS.md` — conventions for AI agents (read before working; the `hmrClient` workaround should be added to it).
- `.gitignore` — ignores `.output`, `.nuxt`, `.data`, `node_modules`, env files, agent tooling dirs.

## Next steps (in order)

1. **Add the `hmrClient` workaround note to AGENTS.md** so future sessions don't remove it.
2. **Decide on `welkugl_logo.png`** (keep as branding or delete).
3. **Make the first commit** (all current work is uncommitted). Check `git status`/`git diff` first, stage intentionally, keep commits small.
4. **First deployment** to Netcup; test `/docus/` through Apache; add robots.txt at domain root.
5. Revisit the sitemap `/docus/` prefix issue if it matters after deployment.