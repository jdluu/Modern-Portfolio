# AGENTS.md: Modern Portfolio (jluu.dev)

Engineering notes for agents and contributors working in this repo. This is the
only agent instruction file here, so fold new lessons into it instead of adding
per-tool config directories (`.agents/`, `.claude/`, `skills-lock.json`).

Write rules that stay true. Prefer an invariant over a record of one fix: "the
hero band is a fixed 16:9, so a portrait capture can never fill it" will still be
correct next year, while "fixed the hero on 2026-08-23" will not. When a rule
turns out to be wrong, correct it in place rather than appending a dated note.

## Ground rules

- **The deployed site (jluu.dev) is the design source of truth.** Compare against
  the live pages before changing layout or styling.
- **Never introduce data you cannot verify.** Course codes, dates, metrics, and
  screenshots must come from a real source or an explicit confirmation. An
  unverifiable number is worse than no number, including in this file.
- **A change is done when the gates pass and the built page was inspected:**
  `pnpm run check`, `pnpm run lint`, `pnpm run build`, plus `pnpm run knip` and
  `pnpm run test:unit`, and green CI on the pushed commit. Leave the workspace
  clean, and remove any scratch file you created.
- **Verify every path you cite.** Documentation is not checked by any build step,
  so a hand-written path drifts silently. Confirm a file exists before naming it.

## Tech stack

| Area              | Choice                                                                                                                                |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | Astro ^7.2.10, `output: "static"`, pages prerendered by default. Never below 7.2.8, which has a critical RCE in AVIF optimisation     |
| Runtime           | Node >= 22 and pnpm 11. pnpm 11 reads its settings from `pnpm-workspace.yaml`, not `package.json`                                     |
| Language          | TypeScript ^6, `extends: astro/tsconfigs/strict`, `target: ES2024`, `strict: true`                                                    |
| Interactive parts | Solid.js ^1.9 via `@astrojs/solid-js`, scoped to `src/components/**/*.tsx` only                                                       |
| Icons             | `astro-icon` with `@iconify-json/lucide`. There is no `public/icons/`                                                                 |
| Images            | Astro's image service on `sharp`; sources under `src/assets/images/`                                                                  |
| Markdown          | `@astrojs/markdown-remark` unified processor with the single rehype plugin `rehype-slug`, whose major must satisfy Astro's peer range |
| Styling           | Hand-written CSS in `src/styles/{reset,global,tokens,typography}.css` plus a sibling `.css` per component. No framework, no Tailwind  |
| Tests             | Vitest (unit, `environment: node`), Playwright (Chromium and Pixel 5)                                                                 |
| Quality gates     | ESLint 10 flat config, Prettier 3, knip, husky with lint-staged, `pnpm audit --prod`                                                  |
| Deploy            | GitHub Pages, published from `main` by `.github/workflows/deploy.yml`                                                                 |

Build knobs in `astro.config.mjs`: `prefetch: true`, Vite `build.target: es2024`,
`cssCodeSplit`, and a `manualChunks` split putting `@astrojs/*` in `astro-vendor`
and other `node_modules` in `vendor`.

## Repo map

```
src/
  content.config.ts         collection schemas (projects, experiences, posts)
  content/{posts,experiences,projects}/*.md
  layouts/BaseLayout.astro  the only layout, and it already renders <main>
  pages/                    routes: index, about, work, blog, contact, 404
    projects/[slug].astro       project case study
    posts/[slug].astro          blog post with a table of contents
    experiences/[slug].astro    experience detail
  components/
    navigation/  cards/  filters/  sections/  blog/  ui/  shared/
  hooks/        usePagination, useProjectFiltering, useDomSync (Solid)
  lib/          content-mappers, sort-utils, utils
  scripts/      navbar, scroll-to-top, toc (plain browser TS, not Astro)
  styles/       reset, global, tokens, typography
  types/        project-card, experience-card, post
tests/
  unit/         sort-utils, toc, utils
  e2e/          images, a11y, navigation, home, plus helpers/{site,fixtures}
```

Path aliases live in `tsconfig.json` and Vitest resolves the same set.

## Commands

| Command              | Purpose                                     |
| -------------------- | ------------------------------------------- |
| `pnpm run dev`       | Development server                          |
| `pnpm run build`     | Static build into `dist/` (gitignored)      |
| `pnpm run preview`   | Serve the built output on :4321             |
| `pnpm run check`     | `astro check`: content schema and types     |
| `pnpm run lint`      | ESLint                                      |
| `pnpm run format`    | Prettier                                    |
| `pnpm run knip`      | Unused files, exports, and dependencies     |
| `pnpm run test:unit` | Vitest                                      |
| `pnpm run test:e2e`  | Playwright, which builds and previews first |

## CI, deployment, and commits

- `ci.yml` runs, in order: `pnpm install --frozen-lockfile`, `prettier --check .`,
  `lint`, `check`, `test:unit`, `knip`, `build`, `playwright install --with-deps
chromium`, `test:e2e`, and `pnpm audit --prod`. Anything green locally but red
  there is usually alias resolution or filename case.
- `deploy.yml` triggers on the same events but is independent and does not wait
  for CI. It re-runs the fast subset itself (`lint`, `check`, `test:unit`, `knip`,
  `audit --prod`, `build`) so a red gate cannot publish, at the cost of running
  those gates twice on a `main` push. E2E is CI-only to keep deploys quick, which
  means a commit can publish while its E2E run is still in flight.
- Runners are pinned to `ubuntu-24.04` rather than `ubuntu-latest`, so a runner
  image change is a deliberate commit.
- The pre-commit hook (husky with lint-staged) runs `eslint --fix` over
  `**/*.{js,jsx,ts,tsx,astro}` and `prettier --write --ignore-unknown` over
  everything staged, so a commit can be rewritten or blocked by it.
- `.prettierignore` excludes `pnpm-lock.yaml`, because pnpm formats it in its own
  style and reformatting it buries the real dependency change in thousands of
  lines of churn.

## Content collections

Defined in `src/content.config.ts`. Three collections, each loaded by `glob` with
the pattern `**/[^_]*.{md,mdx}`, so **a leading underscore excludes a file from
the collection**, which is how drafts and scratch entries are parked.

- **`projects`** — `summary`, `description`, `role`, `technologies`, `tools`,
  `cover`, `thumbnail`, `final`, `startDate`, `endDate`, `programming_languages`,
  `categories`, `background`, `solution`, `process`, `impact`, `reflection`, and
  `links: { live, source }`. `categories` is a closed set — `Web`, `Mobile`,
  `Desktop`, `Data Science` — validated by the schema, and a project may carry
  more than one. It also drives the structured data on the case-study page, so a
  new value needs an entry in the platform map there.
- **`experiences`** — `company`, `logistics`, `technologies`, `work`,
  `showcase`, `thumbnail`, `summary`.
- **`posts`** — `description`, `tags`, `hero`, `links[]`.

Shared base fields are `title`, optional `slug`, optional `date`, and optional
`draft`. Image fields are typed with Astro's `image()`, so a path that does not
resolve fails `pnpm run check` rather than rendering broken.

Project prose lives in frontmatter, not in a Markdown body: the files under
`src/content/projects/` have empty bodies and every sentence sits in
`background`, `solution`, `impact`, or `reflection`.

## Media conventions

Every project has three image roles, and they are never interchangeable:

| File                       | Role                                                          |
| -------------------------- | ------------------------------------------------------------- |
| `thumbnail_<name>.min.png` | The **card image**: the composed thumbnail graphic            |
| `cover_<name>.*`           | The **hero**: a real screenshot of the app's home screen      |
| `final_<name>.*`           | A **video of the app in use**, or an image of one key feature |

All demo media lives under `src/assets/images/projects/<project>/`. A cover that
is byte-identical to the thumbnail means the hero was never really sourced, which
is drift rather than a variant. `.min` belongs on thumbnails only.

- **Thumbnails are composed to a template, not cropped from a screenshot.** The
  deck has one fixed layout (a
  white rounded card slightly above centre holding a flat icon and the project
  name, with a short caption below it) and a per-project palette. Full method,
  prompt template, palette-collision test, and vision checklist:
  `~/.hermes/skills/dev-patterns/frontend-taste-redesign/references/portfolio-thumbnail-generation.md`.
  Runnable generator: `~/.hermes/scripts/generate-project-thumbnail.py`.
- **Videos take precedence over images in the Final Product section.** When
  `final_<name>.mp4` or `.webm` exists, `src/pages/projects/[slug].astro` renders a
  `<video>` (webm first, mp4 fallback) with `final_<name>.png` as its poster, and
  skips the lightbox. Astro has no video pipeline, so the sources come from an
  eager `import.meta.glob`. Because a video renders through `.final-figure`, which
  carries a `72vh` cap, and an image renders through a different wrapper that has
  none, a portrait _image_ final draws a full-column wall while a video does not.
  Converting an image final to a video is what fixes that; recapturing the still
  cannot.
- **Never commit placeholder media.** A 67-byte stub GIF renders as an 8x8 figure
  and the build ships it without complaint.
- **Re-encode rather than re-record** when a demo needs rebuilding:
  `ffmpeg -i in.mov -movflags +faststart -pix_fmt yuv420p final_<name>.mp4`, then
  pull the poster with `ffmpeg -ss 2 -i final_<name>.mp4 -frames:v 1 final_<name>.png`.
  Prefer a real device screencap over a video frame for any still: an h264 frame
  carries compression artifacts that inflate the PNG.
- To capture from an Android device, record with
  `adb shell screenrecord --size 1080x2400 --bit-rate 12000000 --time-limit 60 /sdcard/x.mp4`,
  then pull and crop the 136px status bar at 1080x2400, giving a 1080x2264 still
  that matches the cropped video. Legacy Gradle 7.x projects need a JDK 11
  toolchain and their own `compileSdk` platform rather than the host default.
  Drive the UI by dumping it (`uiautomator dump`) and parsing bounds rather than
  guessing coordinates, and remember that tap targets are state-dependent.

## Design system

### Project detail page

Treat this as a spec. The deployed pages were looked at and preferred over a
redesign.

- **Container max-width:** `110rem`. The root font size is 10px, so that is
  **1100px**, not 1760px. Compute every rem here against 10px.
- **Grid:** `1fr 22rem`, a content column plus a table-of-contents column, with the
  TOC sticky inside its own column.
- **Hero:** 16:9, `clamp(30rem, 50vh, 45rem)` tall on desktop. The title overlays an
  absolute gradient from transparent through `rgba(0,0,0,0.4)` to
  `rgba(0,0,0,0.8)`, at `var(--step-5)`, weight 780. Hover scales the image to 1.03.
- **Intro card:** `var(--color-surface)`, 2rem radius, a soft two-layer shadow, a 1px
  `color-mix` border, and `overflow: hidden`.
- **Summary and actions:** `grid-template-columns: 1fr auto`, with a `border-top` to
  separate it from the hero.
- **Role and tech cards:** a two-column grid at the section level, using
  `var(--color-surface)`, `var(--space-s)` radius, `var(--m3-elevation-1)`, and
  primary-tinted `color-mix` pills at `border-radius: 999px`.
- **Keep:** the lightbox on final product images, the 0.3s `cardFadeIn` pagination
  transition, and the hero scale and card lift on hover.

### Type and space scale

- **The `--m3-font-*` roles are aliases of Utopia steps**, not a competing scale.
  Use either, but do not add a third size system and do not hand-roll a `clamp()`.
- **The root font size is 10px** (`global.css` sets `font-size: 62.5%`), so every
  `rem` in `tokens.css` is 62.5% of its face value: `--step-6` tops out at 45.7px,
  not 73px.
- **The Utopia scales were generated against a 16px root and render at 62.5% of
  their intended size here.** `--step-0` is therefore a label size, not a reading
  size; `--step-body` restores the 16px to 19.1px body intent for prose. Do not
  "fix" this by switching to a 100% root, because the upper steps are calibrated
  against the deployed site and would jump by about 60% at once.
- **`--step--1` is the floor for anything that has to be read.** `--step--2` renders
  under 8px against this root. WCAG sets no minimum font size, so this is a
  legibility rule rather than a conformance one.
- **Prove a size is on the scale by evaluating its `clamp()`** at the viewport you
  tested, not by comparing against its endpoints. The preferred value is a sum, so
  add the terms.

### Markdown-rendered pages

The coursework archives under `src/content/posts/` need explicit CSS care:

- Section headings get a subtle bottom border.
- `.prose ul { list-style: revert; }`, because `reset.css` strips list styles from
  Astro post markdown.
- Fixed-width label columns (course codes) are bolded with a `min-width` so the
  column scans vertically.
- Appendix tables get rounded corners, an outer border, zebra striping, and a hover
  state.
- The content column caps around 70ch, and the TOC sidebar width uses `clamp()`,
  never a fixed value.
- About-page chips: 6 items maximum per degree.

## Testing

`tests/e2e/` sweeps **every** page from the sitemap, on both Playwright projects.
`siteRoutes()` in `tests/e2e/helpers/site.ts` derives the inventory, so never
hardcode a route list: a new page is then covered automatically and a page that
stops being generated drops out. Every sweep asserts the inventory is non-empty so
it cannot pass vacuously.

- **Settle animations before running axe.** The homepage hero fades its text in and
  axe samples colour the moment it runs, so scanning mid-fade reports blended
  foregrounds and fails contrast on text that is legible at rest. Use
  `settleAnimations()`.
- **Lazy media needs a scroll sweep first**, and only _rendered_ images must finish
  loading. The browser never requests a lazy image inside a hidden
  filter or pagination container, so requiring `complete` for those waits forever.
  Use `loadLazyMedia()`.
- **Filter link locators with `:visible`.** The navbar has a desktop-only logo link
  that is first in the DOM but hidden at mobile widths, so an unfiltered `.first()`
  resolves to the wrong element and times out.
- **Assert accessible state, not Playwright visibility, for elements hidden by
  opacity.** The lightbox is `display: flex` and only fades to `opacity: 0`, so
  `toBeHidden()` can never pass; check the `hidden` attribute, `aria-hidden`, and
  `inert`.
- Add delay, scroll, and interaction through the helpers in `site.ts` rather than
  re-deriving it per spec.

## Gotchas

- **`BaseLayout` already provides the `<main>` landmark.** A page that adds its own
  produces two, which breaks WCAG 1.3.1. Use a `<div>` for page-level wrappers.
- **Never allocate grid space for a `position: fixed` element.** It is already out
  of flow, so the reserved column is dead space that squeezes real content. Symptom:
  content looks cramped in a wide container once JS runs.
- **Content inside a closed `<details>` is invisible to axe and fools geometry
  tests.** Chrome returns a layout box for collapsed disclosure content while
  painting none of it, so a `rect > 0` visibility check measures text nobody can
  see. Open every disclosure before scanning, as `auditRoute()` does.
- **Do not measure icon contrast from the `<svg>` root.** Computed `fill` defaults
  to `rgb(0,0,0)` even when the icon paints `currentColor` through a
  `<symbol>`/`<use>` sprite. Inspect painted descendants or sample rendered pixels;
  a per-element screenshot of a sprite can come back blank while its container
  clearly shows the icon.
- **Theme state persists in `localStorage`.** Reusing one browser context across
  pages silently pins the theme for later pages, so use a fresh context per themed
  measurement and assert the applied `data-theme` before trusting a number.
- **A `var()` with a literal fallback hides a missing token.** Define every
  referenced token in both themes; audit for tokens that exist in no theme at all,
  since a light fallback puts light text on a light surface in dark mode. Astro
  scopes CSS per page bundle, so a token defined inside a component stylesheet is
  not global: check resolution on a page that lacks that component. Re-audit with
  the snippet in the git history for `--accent-color`, which should print `[]`.
- **Changing a heading's tag is a rendering change unless the styling class owns
  the appearance.** `typography.css` styles `h1` to `h6` by tag and some rules are
  tag-qualified. To retag safely, pin `font-size`, `font-weight`, `line-height`, and
  `letter-spacing` in the class, pin `font-variation-settings: normal` if the level
  crosses the `@supports (font: -apple-system-body)` block, then prove it with a
  computed-style snapshot. Prefer selecting by class or id over tag.
- **`.page-h2` is not a screen-reader utility.** Each section redefines it as a
  visible page-heading style; only `HomeSection.css` hides it. For text that must be
  hidden but exposed to assistive technology, use `.visually-hidden`.
- **Orphan-media checks false-positive on the demo videos.** The project page
  collects recordings with `import.meta.glob` over a pattern rather than by
  filename, so matching asset basenames against `src/` reports every `.mp4` and
  `.webm` as unreferenced. Only image paths appear literally in frontmatter.
- **`dist/` is stale until rebuilt, and Astro never purges old hashed assets.**
  Never treat a leftover file in `dist/_astro/` as current output.
- **A stale `astro preview` on :4321 makes Playwright test old output silently.**
  `reuseExistingServer` is off only in CI, and Playwright can kill the `pnpm`
  wrapper without killing its `astro preview` child. Check that nothing is on :4321
  before trusting a result, or run `CI=1 pnpm run test:e2e`, which hard-fails on a
  busy port.
- **Keep every local tool agreeing on one address family.** `astro dev` otherwise
  binds only `localhost`, which resolves to `::1` here, so a probe against
  `127.0.0.1` is refused while the server is healthy. `server.host`,
  `preview.host`, and Playwright's `baseURL` are all pinned to `127.0.0.1`; keep
  them in sync.
- **GitHub Pages must be in workflow mode or the deploy serves nothing.** With the
  build type set to "deploy from a branch", GitHub serves the raw repo root, finds
  no `index.html` in an Astro source tree, and the apex 404s while the settings page
  still reports a passing DNS check. `actions/deploy-pages` requires workflow mode
  too. The custom domain lives in repository settings, not a `CNAME` file, because
  workflow-mode publishing ignores one.
- **GitHub Pages serves no custom response headers at all.** A CSP, HSTS,
  `X-Frame-Options`, or cache-control header cannot be set there, so `_headers` and
  `_redirects` do nothing. A CSP would have to go in a `<meta>` tag. Anything that
  must run a script also has to be initialised outside `astro:page-load`, because
  that event only fires if the router loaded.
- **`Enforce HTTPS` stays unavailable until GitHub issues a certificate.** Until
  then GitHub answers on :443 with its `*.github.io` wildcard, so `curl` fails
  hostname verification and the toggle is greyed out, which is normal for up to 24
  hours after a successful Pages build. Before blaming GitHub, rule out a
  restrictive `CAA` record and stale `AAAA` records, which block issuance.
- **Verify DNS against an authoritative resolver, not a plain `curl`.** A local
  resolver can serve stale answers long after propagation, which reads exactly like
  a failed host migration. Cross-check two resolvers, or use
  `curl --resolve <host>:443:<ip>`.
- **pnpm 11 ignores the `pnpm` field in `package.json`.** Settings moved to
  `pnpm-workspace.yaml`, so an overrides block in `package.json` is dead config that
  looks correct and installs the vulnerable version anyway. For a transitive
  advisory whose parent declares a compatible range, pin a narrow override floor
  inside that range rather than bumping the major, and run `pnpm peers check` after
  any version bump.
- **A contact form posting to a third-party API cannot be verified server-side.**
  Web3Forms rejects non-browser requests, returning the same message for a valid and
  an invalid key, so do not read that as a key verdict. Verify with a real browser
  against the live page and assert on the XHR response.
