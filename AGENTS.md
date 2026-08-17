# AGENTS.md — weltkugl.net wiki (Docus)

Instructions for AI agents working in this repository.

## Project

Personal wiki / knowledge base for [weltkugl.net](https://weltkugl.net), built with
Docus on Nuxt 4. Content is written in **English**.

This is the owner's **first Nuxt project** — prioritize idiomatic, well-explained code
over clever shortcuts.

## Stack

- **Nuxt 4** — app framework
- **Docus 5.x** — Nuxt layer / docs theme (`extends: ['docus']`)
- **Nuxt Content v3** — file-based CMS, MDC syntax
- **Nuxt UI v4** — component library (all MDC components use the `u-` prefix)
- **Tailwind CSS 4** (via Nuxt UI)
- **Vue 3** — Composition API, `<script setup>`
- **TypeScript** — strict where the toolchain allows
- **pnpm** — package manager

## Commands

```bash
pnpm dev       # dev server on http://localhost:3000
pnpm build     # production build to .output
```

Use `pnpm` only — never npm/yarn. There is no lint/typecheck script yet; run
`npx nuxi typecheck` if you need to typecheck.

## Project structure

```
content/                  # Markdown pages → routes + sidebar (main work area)
  index.md                # Landing page at /
  1.section-name/         # Numbered folder = top-level sidebar section
public/                   # Static assets (favicon, images)
nuxt.config.ts            # extends: ['docus'] (+ any module additions)
app.config.ts             # Docus branding/theme config (create if/when needed)
app/                      # Optional overrides (components, layouts, pages, css)
server/                   # Optional API routes / server code
```

## How to write a page

- One markdown file per page; **route mirrors the path** under `content/`
  (`content/2.essentials/1.markdown-syntax.md` → `/essentials/markdown-syntax`).
- Numbered folder/file prefixes control **sidebar order and grouping**; keep them.
- Frontmatter (YAML): `title`, `description`, `navigation`, `seo`.
- Use **MDC** for components: `::note`, `::tip`, `::warning`, `::caution`,
  `::card` / `::card-group`, `::steps`, `::field`, `::code-preview`.
- Nuxt UI components **must** be prefixed `u-` in MDC (`::u-page-hero`, `:::u-button`).
  Without the prefix Vue fails to resolve them.
- English content, 2-space indentation, LF endings, action-verb headings.
- See [Docus docs](https://docus.dev) and [MDC syntax](https://content.nuxt.com/docs/files/markdown)
  for structure and component reference when writing new pages.

## Rules for the agent

- Do **not** edit anything inside `node_modules/`, `.nuxt/`, `.data/`, `.output/`.
- Do **not** edit the `docus` layer itself; override via `app/` or `app.config.ts`.
- `docus` is pinned to `^5.12.3` (latest published; `7.x` does not exist — do not
  bump to it).
- Keep `nuxt.config.ts` minimal (`extends: ['docus']`). Add modules there only when needed.
- Search, dark mode, OG images, sitemap, `/mcp` and `/llms.txt` come built in —
  do not reimplement.
- Before committing: `git status`, `git diff`, keep commits small and focused.
  Only commit when explicitly asked.

## Skills

Available to this project:

- **vue3-nuxt-docus** — `.opencode/skills/vue3-nuxt-docus/SKILL.md`
  Load when working on Vue 3 / Nuxt / Docus code or content for this wiki.
- **create-docs** — `.agents/skills/create-docs/` (installed via docus.dev)
  Scaffolding/authoring guidance for Docus docs sites.
