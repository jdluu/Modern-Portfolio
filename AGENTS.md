# AGENTS.md: Modern Portfolio (jluu.dev)

Engineering notes for agents working in this repo.

This is the only agent instruction file here. Fold new lessons into it instead of
adding per-tool config directories (`.agents/`, `.claude/`, `skills-lock.json`).

## Ground rules

- The **deployed site (jluu.dev) is the design source of truth.** Compare against
  the live pages before changing any layout or styling.
- **Don't introduce data you can't verify.** Course codes, dates, metrics, and
  screenshots must come from a real source or a confirmation, not from
  plausibility. An unverifiable number is worse than no number.
- A change is only done when `pnpm run check`, `pnpm run lint`, and
  `pnpm run build` pass and the built page was inspected.

## Tech stack

| Area              | Choice                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | Astro ^7.2, `output: "static"`, pages prerendered by default                                                                        |
| Runtime           | Node >= 22; pnpm 11 (CI pins `pnpm/action-setup` to version 11)                                                                     |
| Language          | TypeScript ^6, `extends: astro/tsconfigs/strict`, `target: ES2024`, `strict: true`                                                  |
| Interactive parts | Solid.js ^1.9 via `@astrojs/solid-js`, scoped to `src/components/**/*.tsx` only                                                     |
| Icons             | `astro-icon` + `@iconify-json/lucide`. There is no `public/icons/`                                                                  |
| Images            | Astro's image service on `sharp`; sources under `src/assets/images/`                                                                |
| Markdown          | `@astrojs/markdown-remark` unified processor, single rehype plugin `rehype-slug`                                                    |
| Sitemap           | `@astrojs/sitemap`                                                                                                                  |
| Styling           | Hand-written CSS: `src/styles/{reset,global,tokens,typography}.css` + a per-component sibling `.css`. No CSS framework, no Tailwind |
| Tests             | Vitest (unit, `environment: node`), Playwright (`chromium` + `Pixel 5`)                                                             |
| Quality gates     | ESLint 10 flat config, Prettier 3, knip, husky + lint-staged                                                                        |
| Deploy            | Netlify: `netlify.toml` runs `pnpm build` and publishes `dist`                                                                      |

Build knobs in `astro.config.mjs`: `prefetch: true`, Vite `build.target: es2024`,
`cssCodeSplit`, and a `manualChunks` split putting `@astrojs/*` in
`astro-vendor` and other `node_modules` in `vendor`.

## Repo map

```
src/
  content.config.ts         collection schemas (posts, experiences, projects)
  content/{posts,experiences,projects}/*.md
  layouts/BaseLayout.astro  the only layout; it already renders <main>
  pages/                    routes: index, about, work, blog, contact, 404
    projects/[slug].astro      project case study (layout spec below)
    posts/[slug].astro         blog post + TOC sidebar
    experiences/[slug].astro   experience detail
  components/
    navigation/   Navbar, Footer, PaginationControls
    cards/        ProjectCard, ExperienceCard (+ their .css)
    filters/      ProjectCardList, ExperienceCardList, FilterDropdown (Solid islands)
    sections/     HomeSection, AboutSection, ProjectSection, ...  (homepage bands)
    blog/ ui/ shared/
  hooks/        usePagination, useProjectFiltering, useDomSync (Solid)
  lib/          content-mappers, sort-utils, utils
  scripts/      navbar, scroll-to-top, toc (plain browser TS, not Astro)
  styles/       reset, global, tokens, typography
  types/        project-card, experience-card, post
tests/
  unit/         sort-utils, toc, utils
  e2e/          images, a11y, navigation, home + helpers/{site,fixtures}
```

Path aliases (`tsconfig.json`): `@/src/*`, `@components/*`, `@layouts/*`,
`@pages/*`, `@images/*`, `@scripts/*`, `@styles/*`, `@hooks/*`, `@lib/*`,
`@app-types/*`. Two more, `@fonts/*` and `@icons/*`, point at `public/fonts/`
and the non-existent `public/icons/`. Vitest resolves the same aliases.

## Commands

| Command              | Purpose                                 |
| -------------------- | --------------------------------------- |
| `pnpm run dev`       | Dev server                              |
| `pnpm run build`     | Static build into `dist/` (gitignored)  |
| `pnpm run preview`   | Serve the built output on :4321         |
| `pnpm run check`     | `astro check`, content schema and types |
| `pnpm run lint`      | ESLint                                  |
| `pnpm run format`    | Prettier                                |
| `pnpm run knip`      | Unused files, exports, dependencies     |
| `pnpm run test:unit` | Vitest                                  |
| `pnpm run test:e2e`  | Playwright (builds and previews first)  |

CI (`.github/workflows/ci.yml`) runs, in order: `pnpm install --frozen-lockfile`,
`lint`, `check`, `test:unit`, `knip`, `build`, `playwright install --with-deps
chromium`, `test:e2e`, `pnpm audit --prod`. Anything green locally but red there
is usually alias resolution or filename case.

The pre-commit hook (husky + lint-staged) runs `eslint --fix` over
`**/*.{js,jsx,ts,tsx,astro}` and `prettier --write --ignore-unknown` over
everything staged, so a commit can be rewritten or blocked by it.
`.prettierignore` excludes `pnpm-lock.yaml` (pnpm formats it in its own style, so
reformatting produces thousands of lines of churn that hide the real dependency
change), `dist/`, `.astro/`, `node_modules/`, `playwright-report/`, and
`test-results/`.

## Content collections

Defined in `src/content.config.ts`. Three collections, each loaded by `glob` with
the pattern `**/[^_]*.{md,mdx}` — **a leading underscore excludes a file from the
collection**, which is how drafts and scratch entries are parked.

- **`projects`** — `summary`, `description`, `role`, `technologies`, `tools`,
  `cover`, `thumbnail`, `final`, `startDate`, `endDate`,
  `programming_languages`, `domains`, `background`, `solution`, `process`,
  `impact`, `reflection`, `links: { live, source }`.
- **`experiences`** — `company: { name, image, imagealt }`,
  `logistics: { role, duration, startDate, endDate, focusArea, status,
department, type }`, `technologies: { tools, skills }`,
  `work: { responsibilities[], achievements[] }`,
  `showcase: { link, description, insight }`, `thumbnail`, `summary`.
- **`posts`** — `description`, `tags`, `hero`, `links[{ label, url }]`.

Shared base fields: `title`, optional `slug`, optional `date`, optional `draft`
(set `draft: true` to keep an entry out of the build). Image fields are typed
with Astro's `image()`, so a path that doesn't resolve fails `pnpm run check`
rather than rendering broken.

## Media conventions

- `final_<name>.png` in a project asset directory is the still shown in the Final
  Product section, and doubles as the demo video poster.
- `final_<name>.mp4` and `final_<name>.webm` (same basename) are the recorded
  demo. When either exists, `src/pages/projects/[slug].astro` renders a
  `<video>` (webm first, mp4 fallback) with the still as its poster, and skips
  the lightbox. Astro has no video pipeline, so the sources come from an eager
  `import.meta.glob`; image sources go through `getImage` and `Image`.
- `final_<name>.gif` is not used anywhere. Content entries point at
  `final_<name>.png`; never add a GIF reference to satisfy the schema.
- **Never commit placeholder media.** A 67-byte stub GIF renders as an 8x8
  figure in the Final Product section, and the build ships it without complaint.
- **All demo media lives under `src/assets/images/projects/<project>/`.** A
  top-level `assets-demo-masters/` folder used to hold original GIF masters; it
  was removed, and no GIF is referenced anywhere. Re-encode from an existing
  recording if a demo needs rebuilding, e.g.
  `ffmpeg -i in.mov -movflags +faststart -pix_fmt yuv420p final_<name>.mp4`,
  and pull a poster with `ffmpeg -ss 2 -i final_<name>.mp4 -frames:v 1 final_<name>.png`.
- `thumbnail_<name>.min.png` is the card image, distinct from `cover_<name>.*`,
  which is the hero. Keep both.

## Project detail page layout

Captured 2026-08-23 after a correction: the deployed pages looked better than a
redesign. Treat this as a spec, not a suggestion.

- **Container max-width:** `110rem` (1760px). Not 72ch, not 68ch, not 52rem.
- **Grid:** `1fr 22rem`, content column plus a TOC sidebar column.
- **TOC:** sticky in its grid column (`position: sticky; top: calc(var(--nav-height) + var(--space-l))`),
  not floating and not JS-positioned.
- **Content column:** no explicit max-width. The grid column is the constraint.
- **Intro card:** `var(--color-surface)` background, `2rem` radius, shadow
  `0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.1)`, 1px
  `color-mix` border, `overflow: hidden`, `var(--space-xl)` bottom margin.
- **Hero:** 16/9, `clamp(30rem, 50vh, 45rem)` tall on desktop. Title overlay uses
  an absolute gradient from transparent through `rgba(0,0,0,0.4)` to
  `rgba(0,0,0,0.8)`. Title is `var(--step-5)`, weight 780, letter-spacing
  -0.025em. Hover scales the image to `1.03`.
- **Summary and actions:** `grid-template-columns: 1fr auto`, padding
  `var(--space-l) var(--space-xl)`, `border-top` to separate from the hero,
  summary at `var(--step-1)`.
- **Role and tech cards:** two-column grid at the section level. Cards use
  `var(--color-surface)`, `var(--space-s)` radius, `var(--m3-elevation-1)`, and a
  1px `color-mix` outline. Pills use `border-radius: 999px` with primary-tinted
  `color-mix` background and border.
- **Do not drop:** lightbox on final product images, the 0.3s `cardFadeIn`
  pagination transition, hero scale and card lift on hover.
- **Type scale:** section headings use `var(--m3-font-headline-medium)`, body
  text stays at `var(--step-0)`. Bumping it to step-2 or step-3 looks
  disproportionate.

## Markdown-rendered pages

Long markdown pages (the coursework archives in `src/content/posts/`) need
explicit CSS care:

- Section headings get a subtle bottom border.
- `.prose ul { list-style: revert; }`, because `reset.css` strips list styles
  from Astro post markdown.
- Fixed-width label columns (e.g. course codes) are bolded with a `min-width` so
  the column scans vertically.
- Appendix tables: rounded corners, outer border, zebra striping, generous
  padding, hover state.
- Content column max-width around 70ch. TOC sidebar width uses `clamp()`, never
  a fixed value.
- About-page chips: 6 items max per degree.

## End-to-end suite

`tests/e2e/` covers three things, each as a sweep across **every** page, on both
the desktop and mobile Playwright projects:

| Spec                 | Asserts                                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `images.spec.ts`     | every image decodes and paints at a real size, no 4xx media/script/style/font request, every demo video decodes with a working poster, every lightbox opens onto a real full-size image       |
| `a11y.spec.ts`       | axe WCAG 2.2 A + AA on every page in **both themes**, axe best-practice, document structure (one `h1`, no level jumps, one main landmark, unique ids, `lang`, title), and skip-link behaviour |
| `navigation.spec.ts` | every page links to every primary page, real click-through from every page, full link-graph strong connectivity in both directions, browser back/forward                                      |

Rules for working on it:

- **Page inventory comes from the sitemap**, via `siteRoutes()` in
  `tests/e2e/helpers/site.ts`. Never hardcode a route list: a new page is then
  covered automatically, and a page that stops being generated drops out. Every
  sweep asserts the inventory is non-empty so it cannot pass vacuously.
- **Settle animations before running axe.** The homepage hero fades its text in,
  and axe samples colour the moment it runs, so scanning mid-fade reports
  blended foregrounds and fails contrast on text that is legible at rest. Use
  `settleAnimations()`, which waits only for finite animations and is bounded.
- **Lazy images need a scroll sweep first**, and only _rendered_ images must
  finish loading. The browser never requests a lazy image inside a hidden
  filter/pagination container, so requiring `complete` for those waits forever.
  Use `loadLazyMedia()`.
- **Filter link locators with `:visible`.** The nav has a desktop-only logo link
  that is first in the DOM but hidden at mobile widths, so
  `navPanel(page).locator('a[href="/"]').first()` resolves to the wrong element
  and times out.
- **Assert accessible state, not Playwright visibility, for elements hidden by
  opacity.** `.lightbox` is `display: flex` and only fades to `opacity: 0`, so
  `toBeHidden()` can never pass; check the `hidden` attribute, `aria-hidden` and
  `inert` instead.
- Add delay/scroll/interaction through the helpers in `site.ts` rather than
  re-deriving it per spec.

## Known pitfalls

- **Never allocate CSS Grid space for a `position: fixed` element.** The fixed
  element is already out of flow, so the reserved column is dead space that
  squeezes real content. This exact bug hit both the blog post and project
  detail templates, which defined `1fr 22rem` and then positioned the TOC
  itself. Symptoms: content looks cramped in a wide container, and the TOC
  appears at the bottom of the page before JS runs.
- Astro post markdown needs an explicit `list-style` revert.
- `dist/` is stale until rebuilt, and Astro never purges old hashed assets from
  it. Never treat leftover files in `dist/_astro/` as current output.
- **A stale `astro preview` on :4321 makes Playwright silently test old output.**
  `webServer` uses `reuseExistingServer: !CI`, and Playwright kills the `pnpm`
  wrapper without always killing its `astro preview` child, so a preview orphaned
  by an earlier run keeps serving an old `dist/` and the next `test:e2e` reports
  green against a build that is not current. Measured here: an orphan survived
  105 minutes and was picked up by a later run. Check nothing is on :4321 before
  trusting a result, or run `CI=1 pnpm run test:e2e`, which disables reuse and
  hard-fails on a busy port.
- **`hermes verify`'s readiness probe checks `127.0.0.1`.** `astro dev` otherwise
  binds only `localhost`, which resolves to `::1` on this host, so the server is
  healthy while the probe reports `Connection refused` for 60s and the whole run
  is `ok: false`. `server.host` and `preview.host` are pinned to `127.0.0.1` in
  `astro.config.mjs`, and `playwright.config.ts` matches, so every local tool
  agrees on one address family. Keep those in sync or the probe regresses.
- **Hand-written paths in docs drift; verify them instead of trusting them.**
  `README.md` had accumulated four dead references that no build step checks:
  `src/content/config.ts` (the real file is `src/content.config.ts`),
  `public/styles/reset.css` (it lives in `src/styles/`), `public/icons/` (which
  does not exist, because icons come from `astro-icon`), and
  `src/components/ui/ThemeToggleButton.tsx` (it is in `shared/`, not `ui/`).
  Before citing a path, confirm it exists.
- **The root font size is 10px.** `global.css` sets `font-size: 62.5%` on the
  root, so every `rem` in `tokens.css` is 62.5% of its face value. `--step-6`
  tops out at 45.7px, not 73px. Compute against 10px or you will misread
  measurements and chase phantoms.
- **A `var()` with a literal fallback hides a missing token.** `var(--token,
#f3f4f8)` looks defensive, but the fallback is a light colour, so in dark
  theme light text landed on light grey and every project page button failed
  WCAG 1.4.3 at 1.08:1. If a token is referenced, define it in both themes;
  audit for tokens that exist in no theme at all.
- **`BaseLayout` already provides the `<main>` landmark.** Page templates that
  add their own `<main>` (or `role="main"`) produce two main landmarks, which
  breaks WCAG 1.3.1 and confuses screen readers. Use a `<div>` for page-level
  wrappers.
- **Changing a heading's tag is a rendering change unless the styling class owns
  the appearance.** `typography.css` styles `h1`–`h6` by tag, and tag-qualified
  rules exist (`.project-section h2`, `.toc-card #toc-label`). `.card
.role-heading` beats `.project-section h2` only by class count. To retag a
  heading safely: pin `font-size`, `font-weight`, `line-height` and
  `letter-spacing` in the class, pin `font-variation-settings: normal` if the
  level crosses the `@supports (font: -apple-system-body)` h1–h3 block, then
  prove it with a computed-style snapshot before/after. Prefer selecting by id
  or class over tag so outline changes cannot restyle a component.
- **`.page-h2` is not a screen-reader utility.** Each section redefines it as a
  _visible_ page-heading style; only `HomeSection.css` adds
  `position: absolute; left: -9999px`. For text that must be hidden but exposed
  to assistive tech, use `.visually-hidden` from `global.css`.
