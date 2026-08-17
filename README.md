# weltkugl.net — wiki

Personal wiki and knowledge base for [weltkugl.net](https://weltkugl.net), served
at `https://weltkugl.net/docus/`.

This is where the world of weltkugl gets written down: notes, guides, build logs
and decisions for the projects living under the weltkugl.net dome — the portal,
the blog, and whatever else spins up. If something was tricky to figure out, it
belongs here so future-me doesn't have to figure it out twice.

Content is written in **English**, in Markdown with MDC components.

This site succeeds the old Astro wiki (`astrovite/`, previously at
`weltkugl.net/www/`). The notes move over section by section.

## The weltkugl.net family

| Project | Path | What it is |
| --- | --- | --- |
| **Portal** | `/` | Front page of weltkugl.net. 
| **Blog (old)** | `../astrovite` | The previous wiki. Astro + Vue + UnoCSS, deployed to `weltkugl.net/www/`. Its deploy pipeline and backup/rollback scripts are the blueprint for this site's. |
| **Wiki** | `.` | This site. Docus on Nuxt 4. |

## Knowledge base

What the wiki is about — carried over from the old wiki:

- **IoT & home automation** — ESP32 firmware, openHAB rules/items, sensors, device monitoring
- **Web development** — patterns, tooling, experiments from building the weltkugl family
- **Software architecture** — notes, trade-offs, practical write-ups
- **Blog & talks** — longer-form thoughts and presentations

## Tech stack

- **[Nuxt 4](https://nuxt.com)** — app framework
- **[Docus 5](https://docus.dev)** — docs theme, pulled in as a Nuxt layer (`extends: ['docus']`)
- **[Nuxt Content v3](https://content.nuxt.com)** — file-based CMS, MDC syntax
- **[Nuxt UI v4](https://ui.nuxt.com)** — component library (all MDC components use the `u-` prefix)
- **[Tailwind CSS 4](https://tailwindcss.com)** — via Nuxt UI
- **[Vue 3](https://vuejs.org)** — Composition API, `<script setup>`
- **TypeScript** — strict where the toolchain allows
- **pnpm** — package manager

Search, dark mode, OG images, sitemap, `/mcp` and `/llms.txt` come built in with
Docus — no custom code needed.

## Base path

The wiki lives in a subfolder on the live site, so `nuxt.config.ts` sets:

```ts
app: {
  baseURL: '/docus/',
},
site: {
  url: 'https://weltkugl.net/docus',
},
llms: {
  domain: 'https://weltkugl.net/docus',
},
```

- Assets, links, canonicals, `/llms.txt` and the sitemap are all `/docus/`-aware.
- `robots.txt` is **disabled** in Nuxt (`robots.robotsTxt: false`) — it must live
  at the domain root, not under `/docus/`. Add it manually on the server.
- **Build with `NUXT_SITE_URL=https://weltkugl.net/docus`** so the prerendered
  sitemap uses absolute URLs.

## Commands

```bash
pnpm install        # install dependencies
pnpm dev            # dev server on http://localhost:3000/docus/
pnpm build          # production build to .output/
npx nuxi typecheck  # typecheck (no lint script yet)
```

Use `pnpm` only — never npm/yarn.

## Project structure

```
content/                  # Markdown pages → routes + sidebar (main work area)
  index.md                # Landing page at /
  1.section-name/         # Numbered folder = top-level sidebar section
public/                   # Static assets (favicon, images)
nuxt.config.ts            # extends: ['docus'] + baseURL (+ any module additions)
app.config.ts             # Docus branding/theme config (create if/when needed)
app/                      # Optional overrides (components, layouts, pages, css)
server/                   # Optional API routes / server code
```

## Writing pages

- One Markdown file per page; the **route mirrors the path** under `content/`
  (`content/2.essentials/1.markdown-syntax.md` → `/essentials/markdown-syntax`).
- Numbered folder/file prefixes control **sidebar order and grouping** — keep them.
- Frontmatter (YAML): `title`, `description`, `navigation`, `seo`.
- Use **MDC** for components: `::note`, `::tip`, `::warning`, `::caution`,
  `::card` / `::card-group`, `::steps`, `::field`, `::code-preview`.
- Nuxt UI components **must** be prefixed `u-` in MDC (`::u-page-hero`,
  `:::u-button`) — without the prefix Vue fails to resolve them.
- 2-space indentation, LF endings, action-verb headings.

See [docus.dev](https://docus.dev) and [MDC syntax](https://content.nuxt.com/docs/files/markdown)
for component and syntax reference while writing new pages.

## Deployment

`pnpm build` produces `.output/` (Node.js server). See
`content/` for the step-by-step Netcup setup guide (or the old wiki's
`astrovite/docs/DEPLOY_guide.md` for the static-build blueprint).

## License

Personal project — content and custom code are not licensed for reuse.
[Docus](https://github.com/nuxt-themes/docus) itself is MIT.
