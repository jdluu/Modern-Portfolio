# AGENTS.md: Modern Portfolio (jluu.dev)

Engineering notes for agents and contributors working in this repo. This is the
only agent instruction file here, so fold new lessons into it instead of adding
per-tool config directories (`.agents/`, `.claude/`, `skills-lock.json`).

**Point at the source; do not restate it.** A field list, a version number, or a
command list duplicates a file that is already authoritative and goes stale the
moment that file changes. Name the file — `src/content.config.ts`, `package.json`,
`astro.config.mjs` — and the rule it implies, and let the reader look. What
belongs here is what no file says: invariants, traps, and decisions.

**Write rules that stay true.** Prefer an invariant over a record of one fix: "the
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

## Stack and configuration

The manifests are the authority on what is installed and at which version:
`package.json` for dependencies and scripts, `astro.config.mjs` for build and
integration config, `tsconfig.json` for compiler settings and path aliases,
`vitest.config.ts`, and `pnpm-workspace.yaml`. Read those before reasoning about
versions. The choices behind them are what will not go stale:

- Static output: every page prerenders. There is no server.
- Solid.js for the interactive parts, scoped to `src/components/**/*.tsx`.
- Hand-written CSS and no framework — no Tailwind, no CSS-in-JS.
- `astro-icon` with the Lucide set. There is no `public/icons/`.
- Images go through Astro's image service on `sharp`, sources under
  `src/assets/images/`.
- Markdown goes through `@astrojs/markdown-remark`; the only rehype plugin is
  `rehype-slug`, whose major version has to satisfy Astro's peer range.
- Vitest for unit tests, Playwright (Chromium and Pixel 5) for end-to-end.
- GitHub Pages publishes from `main`. There is no other host.
- **Never lower a dependency below a version that fixes a known advisory.** The
  current floors are in `package.json` and the lockfile; run `pnpm audit --prod`
  before pinning anything backwards.

`astro.config.mjs` also carries the build knobs (prefetch, Vite target,
`cssCodeSplit`, and a `manualChunks` split). Read it rather than trusting a
summary.

## Layout

The tree is small; read it rather than trusting a map. Three structural facts are
worth knowing before you do:

- `src/layouts/BaseLayout.astro` is the only layout, and it already renders
  `<main>`.
- `src/scripts/` holds plain browser TypeScript, not Astro components.
- Path aliases are declared in `tsconfig.json`, and Vitest resolves the same set,
  so a new alias has to be added in both places.

## Commands

Scripts are defined in `package.json`. Three contracts are not obvious from their
names: `check` validates the content schema and types through `astro check`,
`test:e2e` builds and previews before running so it exercises built output rather
than a dev server, and `knip` is what catches a file or export nothing imports.

## CI, deployment, and commits

`.github/workflows/ci.yml` and `deploy.yml` are the authority on what runs and in
what order. The properties that matter when you reason about a failure:

- CI is the gate that counts. Anything green locally but red there is usually
  alias resolution or filename case.
- `deploy.yml` is independent of CI and re-runs the fast gates itself, so a red
  gate cannot publish — at the cost of those gates running twice on a `main` push.
  End-to-end tests are CI-only, which means a commit can publish while its E2E run
  is still in flight.
- Runners are pinned to a specific Ubuntu image, so a runner change is a
  deliberate commit rather than a surprise.
- The pre-commit hook (husky with lint-staged) fixes and reformats staged files,
  so a commit can be rewritten or blocked by it. Expect a file to have changed on
  disk after committing, and re-read it before editing it again.
- `.prettierignore` excludes `pnpm-lock.yaml`, because reformatting it would bury
  the real dependency change in thousands of lines of churn.

## Content collections

`src/content.config.ts` is the schema, and therefore the authority on every field
name, type, and default. Read it instead of trusting a list here. What follows is
only what the schema cannot tell you.

- Collections load by `glob` with the pattern `**/[^_]*.{md,mdx}`, so **a leading
  underscore excludes a file from the collection** — that is how drafts and
  scratch entries are parked.
- `categories` is a closed set validated by the schema, and a project may carry
  more than one. It also drives the structured data on the case-study page through
  a platform map there, so **a new value needs an entry in that map**, and the
  first listed category is the one that leads the emitted `applicationCategory` —
  author order is meaningful, not cosmetic.
- Add a category only when a project genuinely needs it. A value nothing carries
  is a control that leads nowhere, and the set is supposed to describe work that
  exists.
- Programming languages are deliberately not a field: the prose and the
  `technologies` pills carry the stack, and nothing filters on them. Do not
  reintroduce a field whose only purpose is to feed a filter.
- Image fields are typed with Astro's `image()`, so a path that does not resolve
  fails `pnpm run check` rather than rendering broken.
- Project prose lives in frontmatter, not in a Markdown body: the files under
  `src/content/projects/` have empty bodies, and every sentence sits in one of the
  prose fields the schema defines.

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
  deck has one fixed layout and a per-project palette. The method, prompt
  template, palette-collision test, and vision checklist live at
  `~/.hermes/skills/dev-patterns/frontend-taste-redesign/references/portfolio-thumbnail-generation.md`,
  with a runnable generator at `~/.hermes/scripts/generate-project-thumbnail.py`.
  Read those rather than working from memory.
- **Videos take precedence over images in the Final Product section.** When
  `final_<name>.mp4` or `.webm` exists, `src/pages/projects/[slug].astro` renders a
  `<video>` (webm first, mp4 fallback) with `final_<name>.png` as its poster, and
  skips the lightbox. Astro has no video pipeline, so the sources come from an
  eager `import.meta.glob`. A video renders through `.final-figure`, which carries
  a `72vh` cap, while an image renders through a different wrapper that has none,
  so a portrait _image_ final draws a full-column wall where a video does not.
  Converting an image final to a video is what fixes that; recapturing the still
  cannot.
- **Never commit placeholder media.** A 67-byte stub GIF renders as an 8x8 figure
  and the build ships it without complaint.
- **Re-encode rather than re-record** when a demo needs rebuilding: `ffmpeg -i
in.mov -movflags +faststart -pix_fmt yuv420p final_<name>.mp4`, then pull the
  poster with `ffmpeg -ss 2 -i final_<name>.mp4 -frames:v 1 final_<name>.png`.
  Prefer a real device screencap over a video frame for any still: an h264 frame
  carries compression artifacts that inflate the PNG.
- To capture from an Android device, record with `adb shell screenrecord --size
1080x2400 --bit-rate 12000000 --time-limit 60 /sdcard/x.mp4`, then pull and crop
  the status bar to get a still that matches the cropped video. Legacy Gradle 7.x
  projects need a JDK 11 toolchain and their own `compileSdk` platform rather than
  the host default. Drive the UI by dumping it (`uiautomator dump`) and parsing
  bounds rather than guessing coordinates, and remember that tap targets are
  state-dependent.

## Design system

The deployed pages are the design source of truth, and the case-study layout has
been deliberately kept as it is: restyle it to match, not to replace it. The
measurements live in the stylesheets (`src/pages/projects/projects.css` and the
component styles beside it). What follows are the rules that are easy to break.

- **The root font size is 10px** (`global.css` sets `font-size: 62.5%`). Compute
  every `rem` against 10px, so `110rem` is 1100px and not 1760px — a
  factor-of-1.6 error that looks plausible.
- **The `--m3-font-*` roles are aliases of Utopia steps**, not a competing scale.
  Use either, but do not add a third size system and do not hand-roll a `clamp()`.
- **The Utopia scales were generated against a 16px root and render at 62.5% of
  their intended size here.** `--step-0` is therefore a label size, not a reading
  size; `--step-body` restores the body intent for prose. Do not "fix" this by
  switching to a 100% root, because the upper steps are calibrated against the
  deployed site and would jump by about 60% at once.
- **`--step--1` is the floor for anything that has to be read.** `--step--2`
  renders under 8px against this root. WCAG sets no minimum font size, so this is
  a legibility rule rather than a conformance one.
- **Prove a size is on the scale by evaluating its `clamp()`** at the viewport you
  tested, not by comparing against its endpoints. The preferred value is a sum, so
  add the terms.
- **Keep** the lightbox on final product images, the pagination fade, and the hero
  scale and card lift on hover. Those are deliberate, not incidental.

The coursework archives under `src/content/posts/` are Markdown-rendered and need
explicit CSS care: section headings get a subtle bottom border, `.prose ul`
restores `list-style: revert` because `reset.css` strips list styles from Astro
post markdown, fixed-width label columns are bolded with a `min-width` so the
column scans vertically, and the TOC sidebar uses a `clamp()` width rather than a
fixed value. The content column caps around 70ch, and About-page chips are capped
at 6 items per degree.

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
  loading. The browser never requests a lazy image inside a hidden filter or
  pagination container, so requiring `complete` for those waits forever. Use
  `loadLazyMedia()`.
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
  not global: check resolution on a page that lacks that component.
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
- **`Enforce HTTPS` stays unavailable until GitHub issues the certificate.** Until
  then GitHub answers on :443 with its `*.github.io` wildcard, so `curl` fails
  hostname verification and the toggle is greyed out. Issuance normally takes
  minutes but can sit unstarted for a day or more; a stalled `authorization_created`
  is a DNS problem far more often than a GitHub one, so rule out a restrictive
  `CAA` record and stale `AAAA` records first. Clearing the custom domain in
  repository settings and re-adding it triggers a fresh authorization, which is the
  lever when one has stalled.
- **Verify DNS against an authoritative resolver, not a plain `curl`.** A local
  resolver can serve stale answers long after propagation, which reads exactly like
  a failed host migration. Cross-check two resolvers, or use
  `curl --resolve <host>:443:<ip>`.
- **pnpm ignores the `pnpm` field in `package.json`.** Version settings live in
  `pnpm-workspace.yaml`, so an overrides block in `package.json` is dead config that
  looks correct and installs the vulnerable version anyway. For a transitive
  advisory whose parent declares a compatible range, pin a narrow override floor
  inside that range rather than bumping the major, and run `pnpm peers check` after
  any version bump.
- **A contact form posting to a third-party API cannot be verified server-side.**
  Web3Forms rejects non-browser requests, returning the same message for a valid and
  an invalid key, so do not read that as a key verdict. Verify with a real browser
  against the live page and assert on the XHR response.
