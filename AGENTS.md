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

| Area              | Choice                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | Astro ^7.2.10, `output: "static"`, pages prerendered by default. Never below 7.2.8 — earlier releases have a critical RCE in AVIF image optimisation                                                                                                                                                                                                                        |
| Runtime           | Node >= 22; pnpm 11 (CI pins `pnpm/action-setup` to version 11). pnpm 11 reads its settings from `pnpm-workspace.yaml`, not package.json                                                                                                                                                                                                                                    |
| Language          | TypeScript ^6, `extends: astro/tsconfigs/strict`, `target: ES2024`, `strict: true`                                                                                                                                                                                                                                                                                          |
| Interactive parts | Solid.js ^1.9 via `@astrojs/solid-js`, scoped to `src/components/**/*.tsx` only                                                                                                                                                                                                                                                                                             |
| Icons             | `astro-icon` + `@iconify-json/lucide`. There is no `public/icons/`                                                                                                                                                                                                                                                                                                          |
| Images            | Astro's image service on `sharp`; sources under `src/assets/images/`                                                                                                                                                                                                                                                                                                        |
| Markdown          | `@astrojs/markdown-remark` unified processor, single rehype plugin `rehype-slug`. Its major must satisfy astro's peer range (`^7.3.0` on the 7.2 line)                                                                                                                                                                                                                      |
| Sitemap           | `@astrojs/sitemap`                                                                                                                                                                                                                                                                                                                                                          |
| Styling           | Hand-written CSS: `src/styles/{reset,global,tokens,typography}.css` + a per-component sibling `.css`. No CSS framework, no Tailwind                                                                                                                                                                                                                                         |
| Tests             | Vitest (unit, `environment: node`), Playwright (`chromium` + `Pixel 5`)                                                                                                                                                                                                                                                                                                     |
| Quality gates     | ESLint 10 flat config, Prettier 3, knip, husky + lint-staged, `pnpm audit --prod` (must stay clean)                                                                                                                                                                                                                                                                         |
| Deploy            | GitHub Pages: `.github/workflows/deploy.yml` builds on `main` and publishes `dist`. Pages source must be **GitHub Actions** (`build_type: workflow`), never "Deploy from a branch". Custom domain `jluu.dev` lives in Settings → Pages, not the repo — Actions-based publishing ignores a `CNAME` file, and setting the domain while in branch mode makes GitHub commit one |

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
`prettier --check .`, `lint`, `check`, `test:unit`, `knip`, `build`, `playwright
install --with-deps chromium`, `test:e2e`, `pnpm audit --prod`. Anything green
locally but red there is usually alias resolution or filename case.

**Gate split.** `ci.yml` and `deploy.yml` trigger on the same events but are
independent, and `deploy.yml` does not wait for CI. Deploy re-runs the _fast_
subset itself — `lint`, `check`, `test:unit`, `knip`, `audit --prod`, `build` —
so a red gate cannot publish, at the cost of running those gates twice on a
`main` push. E2E is deliberately CI-only to keep deploys quick, which means a
commit can deploy while its E2E run is still in flight; if that ever matters more
than deploy latency, gate deploy on CI with a `workflow_run` trigger rather than
duplicating more gates. Runners are pinned to `ubuntu-24.04` instead of
`ubuntu-latest`, because the latest label migrates to Ubuntu 26 in October 2026
and a runner image change should be a deliberate commit.

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
- **`.min` belongs only on thumbnails.** `cover_<name>.png` and
  `final_<name>.{png,mp4,webm}` never carry it. A stray `.min` on a cover or
  final is drift, not a variant — rename the file and fix the frontmatter
  reference rather than leaving both.

## Recapturing legacy Android demo media

The 2018–2022 Android repos (ZooSeeker, Flixster, Parsegram, SimpleTweet,
SimpleTodo) need a JDK 11 toolchain, which this host does not default to. A
clone into the scratch directory is enough; capturing media requires no push to
the fork.

- **Toolchain:** Gradle 7.x / AGP 7.2 with `compileSdk 32` will not run on this
  host's JDK 21 or its `android-36` platform. Unpack Temurin JDK 11 to
  `~/.local/opt/jdk-11` (from
  `https://api.adoptium.net/v3/binary/latest/11/ga/linux/x64/jdk/hotspot/normal/eclipse`),
  then
  `~/.local/android-sdk/cmdline-tools/latest/bin/sdkmanager "platforms;android-32" "build-tools;32.0.0"`,
  then build with `JAVA_HOME=~/.local/opt/jdk-11 ANDROID_HOME=~/.local/android-sdk
ANDROID_SDK_ROOT=~/.local/android-sdk ./gradlew assembleDebug`. No sudo is
  needed. `sdkmanager --list` prints packages with `/` separators
  (`platforms/android-32`) even though install syntax uses `;`.
- **Take the still from `adb exec-out screencap -p`, never from a video frame.**
  An h264 frame carries compression artifacts that inflate the PNG — 331 KB vs
  137 KB for the same screen — and quantizing it makes it _larger_ by adding
  dither noise.
- **Crop the status bar.** It is exactly 136px at 1080x2400 on the Pixel 7, so
  crop `(0,136,1080,2400)` for a 1080x2264 still that matches the cropped video.
- **Recording:** `adb shell "nohup screenrecord --size 1080x2400 --bit-rate
12000000 --time-limit 60 /sdcard/x.mp4 >/dev/null 2>&1 &"`, drive the UI, then
  `adb shell pkill -INT screenrecord`. Encode h264 crf 29 + vp9 crf 38 at fps 24
  to land around 0.45 MB, inside the repo's 0.1–0.5 MB convention.
- **Drive the UI by dumping it:** `uiautomator dump` and parse bounds. A
  checkbox tap must hit the `CheckBox` element (x ~160), not the row label.
- **A clean status bar needs demo mode:** `settings put global sysui_demo_allowed
1`, then `am broadcast com.android.systemui.demo` commands, with `-e fully
true` on the network command to clear the wifi "no internet" exclamation.
- **Measure the test baseline before blaming your change.** ZooSeeker's
  JUnit/Robolectric suite is order-flaky: 18 tests, 7 of which also fail on the
  pristine tree, all `Illegal connection pointer` once the suite shares one
  connection. Running a single class with `--tests` passes. A whole-suite count
  is not a verdict on your edit.

## Project detail page layout

Captured 2026-08-23 after a correction: the deployed pages looked better than a
redesign. Treat this as a spec, not a suggestion.

- **Container max-width:** `110rem`. At this project's root that is **1100px**,
  not 1760px — see the root-font-size pitfall below before converting any rem
  here into pixels. Not 72ch, not 68ch, not 52rem.
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

## Type and space scale rules

- **The `--m3-font-*` roles are aliases of Utopia steps**, not a competing scale
  (`--m3-font-headline-large: var(--step-4)`, and so on). Use either, but do not
  introduce a third size system, and do not hand-roll a `clamp()`: a
  `clamp(0.8333rem, 0.55rem + 0.9vw, 1.35rem)` on the homepage eyebrow rendered
  8.33px -> 13.5px and was the only off-scale font size left in the built site.
  When a size "reads too small", the cause is usually the 62.5% root, not the
  step: check the rendered px before compensating.
- **`--step--2` is not a text size here.** It renders 6.94px -> 7.62px against
  this root, and M3's own `label-small` is 11px. `--step--1` (8.33px -> 9.54px) is
  the smallest step for anything that has to be read. Five rules had used
  `--step--2` for chip, badge, eyebrow and subheading text; all were retargeted.
  WCAG sets no minimum font size, so this is a legibility floor, not a
  conformance one - mobile values for `--step--1` bottom out at 8.74px at 393px
  and 8.33px at the 320px design minimum, and that is accepted.
- **Prove "on the scale" by evaluating the clamps**, not by comparing against
  endpoint values: at 393px every step sits between its min and max, so an
  endpoint-only check reports a dozen false "OFF-SCALE" hits. Parse the `clamp()`
  expressions out of `tokens.css` and evaluate them at the tested viewport. Note
  the preferred value is a sum (`0.671rem + 0.1171vw`), so add the terms.

## Known pitfalls

- **Content inside a closed `<details>` is invisible to axe, and worse, it fools
  geometry tests.** Chrome returns a layout box for collapsed disclosure content
  while painting none of it, so a `rect > 0` visibility check measures the colours
  of text nobody can see. That is how a 3.86:1 table header at 9.5px sat inside a
  coursework appendix `<details>` undetected through several audits.
  `auditRoute()` in `tests/e2e/a11y.spec.ts` now opens every disclosure before
  scanning. Anything else that walks "visible" elements needs the same guard.
- **Do not measure icon contrast from the `<svg>` root.** Computed `fill`
  defaults to `rgb(0,0,0)` - the SVG initial - even when the icon actually paints
  `currentColor` through a `<symbol>`/`<use>` sprite. A root-level check invented
  failures on 24 pages, and before that on a footer icon that renders fine.
  Inspect painted descendants, or sample rendered pixels. Note also that a
  per-element screenshot of a sprite `<svg>` can come back blank while a
  screenshot of its container clearly shows the icon - trust the container and
  your own eyes over the element shot.
- **Theme state persists in `localStorage`.** The layout's inline script resolves
  system preference into an explicit theme and `ThemeToggleButton` persists it, so
  reusing one browser context across pages silently pins the theme for later
  pages. A probe that forgets this measures the wrong theme - which is how a false
  "the a11y suite never really tests dark mode" conclusion got reached. Use a
  fresh context per themed measurement, and assert the applied `data-theme`
  before trusting any number.
- **Project prose lives in frontmatter, not in the body.** The
  `src/content/projects/*.md` files have empty bodies; every sentence sits in
  `background`/`solution`/`impact`/`reflection`. A probe that splits on the
  closing `---` and searches "the body" finds blank text and reports zero
  matches for _every_ project, which reads as "the content is missing" rather
  than "the probe is wrong". Search the whole file.
- **Orphan-media checks false-positive on the demo videos.**
  `src/pages/projects/[slug].astro` collects recordings with
  `import.meta.glob("/src/assets/images/projects/*/final_*.{mp4,webm}")` — a
  pattern, not filenames — so matching asset basenames against `src/` reports
  all twelve `.mp4`/`.webm` files as unreferenced. Only image paths appear
  literally in frontmatter. Any name-based orphan check must skip them.
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
- **The deploy host differs from `astro preview`, and GitHub Pages serves no
  custom response headers at all.** Local runs go through `astro preview`, which
  applies no host behaviour, so anything host-specific is invisible to the suite.
  GitHub Pages cannot set headers, so the CSP, HSTS, `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy` and `immutable` cache headers that
  Netlify served are gone — the accepted tradeoff of moving hosts, not an
  oversight. `_headers` and `_redirects` are ignored there, so do not add them
  expecting them to take effect; a CSP would have to go in a `<meta>` tag, and
  Astro's hash-based `security.csp` does not support `<ClientRouter />`.
  Separately, anything that must run a script has to be initialized outside
  `astro:page-load` too: that event only fires if the router itself loaded, and
  when a blocked inline script left the desktop nav visible but `inert`, every
  nav link silently refused clicks while looking perfectly normal.
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
- **The Utopia scales were generated against a 16px root, so they render at
  62.5% of their intended size here.** `--step-0` is `clamp(1rem, …)` — a 16px
  body size on a 16px root, but 10px -> 11.94px on this root. That means
  `--step-0` is a label size, not a reading size. `--step-body` restores the
  16px -> 19.1px body intent for prose. Do **not** "fix" the basis by switching
  to a 100% root: the upper steps (h1 57px, project prose 18.7px) are calibrated
  against the deployed site and would jump ~60% at once.
- **A `var()` with a literal fallback hides a missing token.** `var(--token,
#f3f4f8)` looks defensive, but the fallback is a light colour, so in dark
  theme light text landed on light grey and every project page button failed
  WCAG 1.4.3 at 1.08:1. If a token is referenced, define it in both themes;
  audit for tokens that exist in no theme at all. A full audit on 2026-09-27
  found **17** referenced-but-undefined tokens, and the fallbacks had been
  masking several of them. The worst was `--accent-color`: `.scroll-top` fell
  back to `transparent`, leaving a near-white arrow on the page background —
  invisible, and axe never catches it because the button is `inert` until the
  user scrolls past 50%, which is where the suite runs. Others silently dropped
  whole declarations (`--grid-gap-md` left `.info-row` with no gap, and
  `--m3-color-secondary-container` invalidated an entire `color-mix`). Re-audit
  with:

  ```sh
  python3 -c "import re,pathlib;t=''.join(p.read_text() for p in pathlib.Path('src').rglob('*') if p.suffix in {'.css','.astro','.tsx','.ts'});print(sorted(set(re.findall(r'var\(\s*(--[a-z0-9-]+)',t))-set(re.findall(r'(--[a-z0-9-]+)\s*:',t))))"
  ```

  It should print `[]`. Remember Astro scopes CSS per page bundle, so a token
  defined inside a component stylesheet is _not_ global: check resolution on a
  page that lacks that component, not just on `documentElement` of one page.

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
- **GitHub Pages must be in workflow mode, or the deploy silently serves
  nothing.** Pages has two build types and they are not interchangeable.
  `build_type: legacy` ("Deploy from a branch") makes GitHub try to serve the raw
  repo root; on an Astro source tree there is no `index.html` there, so the build
  reports `status: errored` and the apex 404s _while the Settings page still shows
  a passing DNS check_. `actions/deploy-pages` also requires workflow mode, so the
  workflow fails too. Check with `gh api repos/<owner>/<repo>/pages` — it should
  print `build_type: workflow`. Switch it with
  `gh api -X PUT repos/<owner>/<repo>/pages -f build_type=workflow -f cname=<domain>`;
  pass `cname` too or you can drop the custom domain. Related: setting a custom
  domain _while in branch mode_ makes GitHub commit a root `CNAME` file, which then
  sits in the tree doing nothing, because workflow-mode publishing ignores it.
- **`Enforce HTTPS` stays unavailable until GitHub has issued a certificate, and
  the tell is the TLS subject.** While a domain has no cert, GitHub answers on
  :443 with its default `CN=*.github.io` wildcard, so `curl` fails hostname
  verification (`HTTP 000`) and the toggle is greyed out with "a certificate has
  not yet been issued". That is normal until a Pages build succeeds, and can take
  up to 24h afterwards. Before blaming GitHub, rule out the DNS-side blockers: a
  restrictive `CAA` record prevents Let's Encrypt from issuing at all, and stale
  `AAAA` records point traffic (and validation) at the old host. Check both with
  `https://dns.google/resolve?name=<host>&type=CAA` and `type=AAAA`.
- **pnpm 11 ignores the `pnpm` field in `package.json` entirely.** Settings moved
  to `pnpm-workspace.yaml`. A `pnpm.overrides` block in `package.json` is dead
  config: pnpm warns `The "pnpm" field in package.json is no longer read`, ignores
  the key, and installs the vulnerable version anyway while the edit _looks_
  correct. Put overrides in `pnpm-workspace.yaml` under `overrides:`. This repo
  gates on `pnpm audit --prod`, and the mechanism for a transitive advisory whose
  parent declares a compatible range is a narrow override floor (e.g.
  `svgo: ^4.1.0`), not a major bump — read the parent's declared range first, then
  pin inside it. Bumping a direct dependency can also reveal a peer range its own
  manifest expects (astro 7.2.10 requires `@astrojs/markdown-remark ^7.3.0`), so
  run `pnpm peers check` after any version bump.
- **This host's resolver serves stale DNS answers.** After a delegation or record
  change, dnsmasq here keeps returning the _old_ host long after propagation:
  `jluu.dev` still resolved to Netlify's IPv6 addresses and `curl` reported
  `Server: Netlify` with Netlify's older cert, which reads exactly like a failed
  migration. Authoritative and Cloudflare DoH already showed the correct GitHub
  IPs. Never diagnose DNS or a host cutover from plain `curl`/`getent` on this box.
  Verify against the authoritative address with
  `curl --resolve <host>:443:<ip> https://<host>/`, or with
  `https://dns.google/resolve?name=<host>&type=A`, and cross-check two resolvers.
- **A contact form that posts to a third-party API cannot be verified
  server-side.** Web3Forms rejects non-browser requests outright — both a valid and
  a deliberately invalid key return the same "This method is not allowed ... (Pro
  plan is required)" body, and adding `Origin`/`Referer` does not change it. Do not
  read that message as a key verdict. Verify with a real browser driving the live
  page (`chromium.launch({ headless: false })` under `xvfb-run`) and assert on the
  XHR response: a working key returns `200` with
  `{"success":true,"message":"Form submitted successfully!"}`. Note the submission
  really is delivered, so label the test payload as such.
