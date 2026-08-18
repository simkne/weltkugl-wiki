# Handoff — weltkugl.net wiki (Docus)

Date: 2026-08-18 (end of session)

Handoff for continuing work on the Docus wiki at `https://weltkugl.net/docus/`.

## Project state at handoff

- **Production build**: works. `NUXT_SITE_URL=https://weltkugl.net pnpm build`
- **Dev server**: works on `http://localhost:3000/docus/` (fallback port 3001/3002 if 3000 is taken). Requires the Vite plugin workaround in `nuxt.config.ts` (see below).
- **Git**: committed and pushed to `github.com:simkne/weltkugl-wiki.git`, branch `main`. Working tree clean.
- **Deployment**: **LIVE and verified.** `https://www.weltkugl.net/docus/` returns 200; content pages, `/llms.txt`, and `/docus/welkugl_logo.png` all serve correctly. Landing page renders correctly (content + styling). Managed by **Plesk Node.js** (not pm2-over-SSH — see below).

## Deployment — HOW IT ACTUALLY RUNS (final, verified)

**Key insight: this is Plesk hosting. The app is started by Plesk's Node.js manager, NOT by the SSH/pm2 workflow.**

- Plesk Node.js app: root = `httpdocs`, startup file = the app's server entry (`docus/.output/server/index.mjs` — the exact startup path was wrong and caused a 500; fixing it in Plesk made it work).
- **After each deploy, the app must be restarted in Plesk** (Node.js section → Restart). It does NOT auto-reload reliably; a stale process keeps serving old code until restarted. There is no known way to trigger the restart from SSH (chroot can't reach the process, no `plesk` CLI, no `.restart`-file trigger found).
- Node/nodenv live at the **host** (`/opt/plesk/node`, linked from `/.nodenv/versions`) — **not reachable from the SSH chroot**. SSH users physically cannot run `node`/`npm`/`pm2`. Do not debug "node not found" over SSH; the process runs under Plesk.
- pm2 installed locally at `/weltkugl.net/node_modules/.bin/pm2` but is NOT what serves the app. The GitHub Actions "Restart" step's pm2 lookup is moot under Plesk (it will fail; harmless).
- Apache/Plesk handle routing; the `.htaccess` at httpdocs root still has stale lines from the old Astro site (e.g. `ErrorDocument 404 /www/404.html`) — clean up when convenient.

## Key facts to preserve

### Subfolder deployment (`/docus/`)

- `nuxt.config.ts` sets `app.baseURL: '/docus/'`.
- `site.url` must be **domain-only** (`https://weltkugl.net`) — nuxt-site-config rejects path values. The base path comes from `app.baseURL`.
- `llms.domain` **does** include the path: `https://weltkugl.net/docus`.
- `robots.robotsTxt: false` — robots.txt must live at the domain root, so it's added manually on the server, not generated under `/docus/`.
- `NUXT_SITE_URL` env at build time = `https://weltkugl.net` (domain only).

### Server layout (Netcup, important!)

The SSH user is **chrooted**: the server's real absolute path
`/var/www/vhosts/hosting186292.a2e5e.netcup.net/` appears as **`/`** in the SSH shell.

- Server hostname: `hosting186292.a2e5e.netcup.net` (= IP `91.204.46.94`)
- `DEPLOY_PATH` secret = **`/weltkugl.net/httpdocs/docus`** (chroot-relative!)
- pm2 lives at **`/weltkugl.net/node_modules/.bin/pm2`** (installed at the vhost root, one level above the app — NOT global, NOT inside the app)
- Files are deployed into `/weltkugl.net/httpdocs/docus/.output/` + `ecosystem.config.cjs` alongside it.
- WARNING: an earlier typo deployed files into `/weltkugl.net/httpdocs/docu` (missing `s`). If it still exists, remove it: `rm -rf /weltkugl.net/httpdocs/docu`.

### GitHub Secrets (all set)

- `SSH_HOST` = `hosting186292.a2e5e.netcup.net`
- `SSH_USERNAME` = the web/SSH user the deploy key authenticates as
- `SSH_PRIVATE_KEY` = private key `~/.ssh/docus_deploy` on the Mac (public key registered in the server's `authorized_keys`; comment `github-actions-docus-deploy`)
- `DEPLOY_PATH` = `/weltkugl.net/httpdocs/docus`

### Deployment pipeline (GitHub Actions → Netcup)

- `.github/workflows/deploy.yml`:
  1. `pnpm install --frozen-lockfile` + `pnpm build` (Linux x64, `NUXT_SITE_URL=https://weltkugl.net`) — **the built `node_modules` is included**; no server-side install needed, and a Mac build must NOT be uploaded (ships `@img/sharp-darwin-arm64` which won't run on Linux).
  2. **Backup**: inlined in the workflow (no server script). Tars current `.output/` to `backups/backup-<ts>.tar.gz`, keeps last 5. First deploy skips.
  3. **Deploy**: `tar | ssh` stream (no rsync required on the server — though rsync IS now installed there). Clears `.output/` first (no stale chunks). Also ships `ecosystem.config.cjs`.
  4. **Restart**: loads shell profile, finds pm2 (PATH → app → vhost-root → npm global), `pm2 start/restart docus-wiki`. **Moot under Plesk** — Plesk manages the process itself; the step is harmless but does not control the running app.
- `ecosystem.config.cjs` — app `docus-wiki`, `cwd: '/weltkugl.net/httpdocs/docus'`, `HOST=127.0.0.1`, `PORT=3001`, fork mode. **Only used if running pm2 manually; Plesk does not use it.**
- The actual running app is configured in the **Plesk panel** (Node.js section for weltkugl.net): root = `httpdocs`, startup file = `docus/.output/server/index.mjs`.

### Sitemap — OPEN ISSUE (not fixed)

**Problem**: Docus's built-in sitemap generates absolute URLs **without** the `/docus/` prefix. This is cosmetic (crawlers follow relative paths fine) but means `https://weltkugl.net/hosting/...` etc. which 404 on the live site.

**Tried**: custom `server/routes/sitemap.xml.ts` override copying Docus's handler + prepending `baseURL`. It was never picked up at runtime (Docus's built-in route won), and it broke `pnpm dev` with `Cannot find package '@nuxt/content'`. **The file was deleted.** Do not recreate it without first confirming route-precedence works.

**Status**: deferred. Options for later: (a) accept the cosmetic issue, (b) nuxi/nuxt-content `sitemap` module route override via a Nitro plugin hook instead of a route file, (c) patch via `site.url` + robots config if a future Docus version supports it.

### The `hmrClient` bug — FIXED, do not remove the workaround

- **Symptom**: dev console error `Uncaught ReferenceError: Cannot access 'hmrClient' before initialization` at `createHotContext` → breaks ALL client JS (no sidebar, no search, dead mobile menu).
- **Root cause**: Nuxt 4.5.2 framework bug. `@vite/client` imports `nuxt/app/compat/interval.js` → imports the diagnostics chain → `nostics` dev reporter calls `createHotContext()` at module top-level before `client.mjs` has initialized `hmrClient`. Circular-import dead zone.
- **Fix**: Vite plugin `strip-nostics-dev-hmr-hookup` in `nuxt.config.ts`. It replaces `import.meta.hot` with `undefined` in the nostics dev reporter module, so Vite's import-analysis skips injecting the top-level `createHotContext()` call. The reporter is best-effort only and no-ops gracefully.
- **Do NOT** pin Nuxt ≤ 4.4.8 to "fix" this: that regresses to Vite 7/Rollup which fails the build on `node-mock-http`'s minified file (`Identifier "h" has already been declared` in `nodeless.mjs`). Stay on Nuxt 4.5.2 + Vite 8 (Rolldown).
- **DO NOT regenerate `pnpm-lock.yaml`** casually. Deleting it and reinstalling drifts Vite 8 → Vite 7/Rollup and breaks builds. If deps must change, use `pnpm add`/`pnpm update` which keep the lockfile's Vite 8 resolution.

### Versions that work (current, verified)

- nuxt `4.5.2` (Vite 8.2.1 / Rolldown) — installed & lockfile-pinned
- docus `^5.12.3` (never bump to 7.x — doesn't exist)
- `package.json` declares `"nuxt": "^4.5.2"` and `"packageManager": "pnpm@10.18.2"`

## Content

- `content/index.md` — landing page (rewritten for the wiki concept). **MDC syntax was fixed this session**: component props must be wrapped in `---` YAML blocks inside `:::u-*` components (bare `icon:`/`color:` lines render as raw text), and nested blocks must use plain indentation, NOT `##`-prefixed lines. Verified rendering correctly live.
- `content/1.hosting/1.deploy-first-node-app-to-netcup.md` — full deployment guide used as the reference article.
- `content/2.projects/1.iot/` — IoT knowledge base migrated from `astrovite/src/content/iot/`:
  - `1.overview.md` → `/projects/iot/overview`
  - `2.esp32/1.getting-started.md` → `/projects/iot/esp32/getting-started`
  - `3.openhab/1.overview.md`, `2.openhabian-maintenance.md`
  - `3.openhab/3.device-monitoring/{1.minimal,2.flexible,3.integrate-existing}-device-monitoring.md`
  - `4.sensors/1.overview.md`
- All routes verified returning 200 in production preview.

## Also in repo

- `app.config.ts` — Docus theming: `header.logo` points at `/docus/welkugl_logo.png` (both light/dark), `header.title: 'weltkugl'`. Logo asset serves correctly live; **visual confirmation in the header still open** (confirm next session).
- `public/welkugl_logo.png` — 480×480 PNG, committed. Used as the header logo.
- `AGENTS.md` — conventions for AI agents. **TODO: add the `hmrClient` workaround, the Plesk server layout, and the MDC-prop gotcha so future sessions don't break/rediscover them.**
- `HANDOFF.md` — this file.
- `.gitignore` — ignores `.output`, `.nuxt`, `.data`, `node_modules`, env files, agent tooling dirs.

## Next steps (in order)

1. **Restart workflow automation**: after each push, the app must be restarted in Plesk. Explore: (a) Netcup CCP node restart, (b) a way to have the GH workflow hit a Plesk-triggered reload, or (c) accept manual restart in Plesk after each deploy.
2. **Confirm the header logo** renders visually at `https://www.weltkugl.net/docus/`; adjust `app.config.ts` if not.
3. **Add the `hmrClient` workaround, Plesk server layout, and MDC-prop gotcha to AGENTS.md** so future sessions don't remove/rediscover them.
4. **Clean up the stale `.htaccess`** at httpdocs root (old Astro lines: `ErrorDocument 404 /www/404.html`, instantindexer bits).
5. **Remove the leftover typo folder** `/weltkugl.net/httpdocs/docu` on the server if it still exists.
6. Revisit the sitemap `/docus/` prefix issue if it matters (SEO).