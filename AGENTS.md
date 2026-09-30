# AGENTS.md: modern-portfolio (jluu.dev)

Astro static site for jluu.dev. `package.json`, `astro.config.mjs`,
`tsconfig.json`, and `src/content.config.ts` are authoritative for versions,
scripts, aliases, and schema fields — read them rather than trusting a summary
here. This file holds only what those files cannot state. Write rules that stay
true; when one proves wrong, correct it in place instead of appending a dated note.

## Commands

| Task           | Command                                           |
| -------------- | ------------------------------------------------- |
| Build          | `pnpm run build`                                  |
| Types + schema | `pnpm run check`                                  |
| Lint           | `pnpm run lint`                                   |
| Format         | `pnpm run format`                                 |
| Unused code    | `pnpm run knip`                                   |
| Unit tests     | `pnpm run test:unit`                              |
| One unit file  | `pnpm exec vitest run tests/unit/toc.test.ts`     |
| E2E            | `pnpm run test:e2e`                               |
| One e2e file   | `pnpm exec playwright test tests/e2e/toc.spec.ts` |

Non-obvious contracts: `check` validates the content schema _and_ types via
`astro check`; `test:e2e` builds and previews first, so it exercises built output
not a dev server; `knip` catches files and exports nothing imports. No gate needs
an env var.

- **CI-only:** `CI=1 pnpm run test:e2e` sets `retries: 2`, `workers: 1`,
  `reuseExistingServer: false`, so a busy :4321 fails the run instead of silently
  testing old output.
- **This host:** when Playwright owns the webServer, `astro preview` can die
  mid-run and every later test fails with `ERR_CONNECTION_REFUSED` — a harness
  artifact, not a regression. Locally run `pnpm preview` yourself, then
  `pnpm exec playwright test` without `CI=1`. CI in a clean container is the gate
  that counts.

## Boundaries

**Always** — run `check`, `lint`, `build`, `knip`, `test:unit` and get green CI on
the pushed commit; compare against the deployed pages before changing layout or
styling (jluu.dev is the design source of truth, and the case-study layout is
deliberately as-is); verify every path you cite, since no build step checks docs;
prove a new guard bites by reverting the fix, running the spec, confirming the
expected failure, and restoring, because a green suite proves nothing when the
check is a no-op; leave the tree clean and delete any scratch file you created.

**Ask first** — adding a runtime dependency or changing any version pin; changing
a content-collection field, type, or the `categories` set; anything that
publishes (pushing `main`, repository settings, or a project's cover, final, or
thumbnail media).

**Never** — introduce unverifiable data: course codes, dates, metrics, and
screenshots need a real source or explicit confirmation, and an unverifiable
number is worse than no number, including here; lower a dependency below a
version fixing a known advisory (`pnpm audit --prod` before pinning backwards,
`pnpm peers check` after any bump); "secure" the Web3Forms access key by moving it
behind an env var or server endpoint, which breaks the form (see Invariants);
commit placeholder media, a genuine credential, or a hand-edited `dist/`; add a
per-tool agent config directory (`.agents/`, `.claude/`, `skills-lock.json`)
instead of folding lessons into this file.

## Project structure

```
src/content.config.ts  schema: every field name, type, default
src/content/           projects/ (frontmatter-only prose), posts/ (Markdown)
src/pages/projects/    [slug].astro + projects.css, the case-study template
src/components/        .astro by default; .tsx is Solid and the only island
src/scripts/           plain browser TypeScript, not Astro components
src/layouts/           BaseLayout.astro, the only layout; it renders <main>
src/styles/            global.css (root font size), typography.css
tests/unit/            vitest, node environment
tests/e2e/             playwright; shared helpers in helpers/site.ts
```

A new path alias must be added to **both** `tsconfig.json` and the Vitest
`resolve` config or tests silently fail to resolve it. Solid is scoped by
`include` in `astro.config.mjs` to `src/components/**/*.tsx`. Images go through
Astro's image service on `sharp`; `astro-icon` uses Lucide and there is no
`public/icons/`.

## Code style

Strict TypeScript, no `any`, no CSS framework (no Tailwind, no CSS-in-JS).
Comments explain _why_, and the traps below set the precedent. Browser scripts
must tolerate running twice, because the router can deliver a page with no
document reload:

```ts
const CONTAINER = ".project-toc";
document.addEventListener("DOMContentLoaded", initToc);
document.addEventListener("astro:page-load", initToc);

function initToc(): void {
  const el = document.querySelector(CONTAINER) as HTMLElement | null;
  if (!el || el.dataset.tocInit === "1") return; // idempotence guard
  el.dataset.tocInit = "1";
}
```

- **Measure, never parse, a CSS length in JS.** `parseInt("4rem")` returns `4`;
  it silently scrolled every section heading behind the navbar. Use
  `getBoundingClientRect()`.
- **Geometry belongs to the stylesheet.** A controller sets a class and accessible
  state, not `width` or `display`; inline values compete with the stylesheet and
  win.

## Testing

Vitest for units (node), Playwright for e2e on Chromium and Pixel 5. Tests are
hermetic: the codebase's only network call is the contact form's Web3Forms POST,
browser-only, so verify it against the live page by asserting the XHR response —
Web3Forms returns the same body for a valid and an invalid key and 403s for
server-side callers, so `curl` is neither a key verdict nor a verification, and
never report one as the other.

`tests/e2e/` sweeps **every** page from the sitemap, and `siteRoutes()` in
`tests/e2e/helpers/site.ts` derives that inventory, so never hardcode a route
list; every sweep asserts it is non-empty so it cannot pass vacuously.
Determinism rules, each from a real false result:

- Use the `site.ts` helpers rather than re-deriving delay, scroll, or interaction
  per spec: `settleAnimations()` before axe (the hero fades text in, and sampling
  mid-fade fails contrast on legible text), `loadLazyMedia()` (only _rendered_
  images load, so requiring `complete` on a lazy image in a hidden container waits
  forever), `settleDom()` before selecting an element on an island-rendered page,
  and `settleScroll()` (requires an observed movement before accepting stability,
  since a scroll that has not started also looks stable).
- Filter locators with `:visible`: the navbar logo link is desktop-only but first
  in the DOM, so an unfiltered `.first()` resolves to a hidden element.
- Assert accessible state, not Playwright visibility, for elements hidden by
  opacity. The lightbox is `display: flex` fading to `opacity: 0`, so
  `toBeHidden()` can never pass; check `hidden`, `aria-hidden`, `inert`.
- Use a fresh context per themed measurement and assert `data-theme` before
  trusting a number, since theme state persists in `localStorage`.
- Open every `<details>` before scanning: Chrome returns a layout box for collapsed
  disclosure content while painting none of it, so `rect > 0` measures invisible
  text.

## Git workflow

Branch off `main` for anything non-trivial; both workflows key on `main` and
`deploy.yml` is independent of CI, so a push publishes even while its e2e run is
in flight. Use conventional commit subjects (`fix(projects):`,
`content(posts):`). The pre-commit hook (husky + lint-staged) runs `eslint --fix`
and `prettier --write` on staged files, so it can rewrite or block a commit — expect
a file to have changed on disk afterwards and re-read before editing again, and note
`.prettierignore` excludes `pnpm-lock.yaml` so a real dependency change is not
buried in churn.

**Done when** `check`, `lint`, `build`, `knip`, and `test:unit` exit 0; `test:e2e`
passes locally or in CI; the built page was inspected, not just built; CI is green
on the pushed commit; and the tree is clean with no scratch files.

## Invariants

**Design system.** The root font size is 10px (`global.css` sets `62.5%`), so every
`rem` computes against 10px: `110rem` is 1100px, not 1760px. The `--m3-font-*`
roles are aliases of the Utopia steps, not a competing scale — use either, never a
hand-rolled `clamp()`, and prove a size is on the scale by evaluating its `clamp()`
at the tested viewport (the preferred value is a sum, so add the terms). At this
root `--step-0` is a label size, `--step-body` restores body intent for prose, and
`--step--1` is the floor for anything readable; `--step--2` renders under 8px, a
legibility rule rather than a conformance one. Do not "fix" the root to 100%: the
upper steps are calibrated against the deployed site and would jump ~60% at once.
Keep the lightbox on final images, the pagination fade, and the hero scale and card
lift on hover. `.page-h2` is a visible heading style redefined per section, not a
screen-reader utility; use `.visually-hidden`.

**Content collections.** `src/content.config.ts` is the schema, so read it rather
than trusting a list here. Collections load by `glob` over `**/[^_]*.{md,mdx}`, so a
**leading underscore excludes a file** — that is how drafts are parked.
`categories` is a closed set, a project may carry several, and it drives the
structured data on the case-study page through a platform map there: a new value
needs an entry in that map, and the first listed category leads the emitted
`applicationCategory`, so author order is meaningful. Add a category only when a
project needs one. Programming languages are deliberately not a field; do not
reintroduce one that exists only to feed a filter. Image fields use Astro's
`image()`, so an unresolvable path fails `check` rather than rendering broken.
Project prose lives in frontmatter, and files under `src/content/projects/` have
empty bodies.

**Contact form.** The Web3Forms access key in
`src/components/sections/ContactSection.astro` is committed in plain text
deliberately and must stay that way. It is not a credential: an access key is an
alias for the destination inbox, stores nothing, and is designed to ship in
client-side code, so the form cannot work without it in the HTML. The exposure
equals publishing the destination address, so the residual risk is spam rather than
disclosure, and Trusted Domains is the mitigation. Do not convert it to an env var,
build-time secret, or server proxy. Keep the explanatory comment above the input
when editing that file.

**Media.** Three roles per project, never interchangeable, all under
`src/assets/images/projects/<project>/`:

| File                       | Role                                                      |
| -------------------------- | --------------------------------------------------------- |
| `thumbnail_<name>.min.png` | card image: the composed thumbnail graphic                |
| `cover_<name>.*`           | hero: a real screenshot of the app's home screen          |
| `final_<name>.*`           | a video of the app in use, or an image of one key feature |

`.min` belongs on thumbnails only, and a cover byte-identical to the thumbnail
means the hero was never sourced — drift, not a variant. Never commit placeholder
media. Thumbnails are composed to a template with a per-project palette, not cropped
from a screenshot; the method, prompt template, palette-collision test, and vision
checklist live at
`~/.hermes/skills/dev-patterns/frontend-taste-redesign/references/portfolio-thumbnail-generation.md`
with a generator at `~/.hermes/scripts/generate-project-thumbnail.py` — read those
rather than working from memory. Videos take precedence over images in Final
Product: with a `final_<name>.mp4`/`.webm` present the page renders a `<video>`
(webm first, mp4 fallback) with the png as poster and skips the lightbox, and since
Astro has no video pipeline the sources come from an eager `import.meta.glob`. A
video renders through `.final-figure`, capped at `72vh`, while an image renders
through a wrapper with no cap, so a portrait _image_ final draws a full-column wall
that a video does not and only conversion to video fixes it. Re-encode rather than
re-record (`ffmpeg -i in.mov -movflags +faststart -pix_fmt yuv420p
final_<name>.mp4`), and prefer a real device screencap over a video frame for any
still since an h264 frame carries artifacts that inflate the PNG. Capture with `adb
shell screenrecord --size 1080x2400 --bit-rate 12000000 --time-limit 60`, then crop
the status bar to match, and drive the UI through `uiautomator dump` bounds rather
than guessed coordinates; tap targets are state-dependent.

## Traps

- **`BaseLayout` already provides `<main>`.** A page adding its own produces two
  landmarks and breaks WCAG 1.3.1. Use a `<div>` for page-level wrappers.
- **Never allocate grid space for a `position: fixed` element.** It is out of flow,
  so the reserved column is dead space that squeezes content once JS runs.
- **Do not measure icon contrast from the `<svg>` root.** Computed `fill` defaults
  to `rgb(0,0,0)` even when the icon paints `currentColor` through a
  `<symbol>`/`<use>` sprite; inspect painted descendants or sample rendered pixels,
  because a per-element screenshot of a sprite can come back blank while its
  container clearly shows the icon.
- **A `var()` with a literal fallback hides a missing token.** Define every
  referenced token in both themes and audit for tokens in no theme, since a light
  fallback puts light text on a light surface in dark mode. Astro scopes CSS per
  page bundle, so a token in a component stylesheet is not global.
- **De-duplicating CSS silently activates the declarations that were losing.** Where
  one selector is declared twice the later block wins per property, so carrying the
  loser's values into a merged rule applies declarations that never applied. Merge
  only the values that actually won, then prove neutrality with a computed-style
  fingerprint across viewports, themes, and states.
- **Changing a heading's tag is a rendering change** unless the styling class owns
  the appearance, since `typography.css` styles `h1`–`h6` by tag and some rules are
  tag-qualified. To retag, pin `font-size`, `font-weight`, `line-height`, and
  `letter-spacing` in the class, pin `font-variation-settings: normal` if the level
  crosses the `@supports (font: -apple-system-body)` block, then prove it with a
  computed-style snapshot. Prefer selecting by class or id over tag.
- **Orphan-media checks false-positive on demo videos.** The project page collects
  recordings by `import.meta.glob` pattern, not filename, so matching basenames
  against `src/` reports every `.mp4` and `.webm` as unreferenced; only image paths
  appear literally in frontmatter.
- **`dist/` is stale until rebuilt, and Astro never purges old hashed assets.** Never
  treat a leftover file in `dist/_astro/` as current output.
- **Keep every local tool on one address family.** `server.host`, `preview.host`, and
  Playwright's `baseURL` are pinned to `127.0.0.1`, and a probe against the other
  family is refused while the server is healthy.
- **pnpm ignores the `pnpm` field in `package.json`.** Version settings live in
  `pnpm-workspace.yaml`, so an overrides block in `package.json` is dead config that
  looks correct and installs the vulnerable version anyway. For a transitive advisory
  whose parent allows a compatible range, pin a narrow override floor inside that
  range rather than bumping the major.
- **GitHub Pages must be in workflow mode or the deploy serves nothing.** On "deploy
  from a branch" GitHub serves the raw repo root, finds no `index.html` in an Astro
  source tree, and the apex 404s while settings still report a passing DNS check;
  `actions/deploy-pages` requires workflow mode too, and the custom domain lives in
  repository settings, not a `CNAME` file.
- **GitHub Pages serves no custom response headers.** A CSP, HSTS,
  `X-Frame-Options`, or cache-control header cannot be set there, so `_headers` and
  `_redirects` do nothing; a CSP would have to go in a `<meta>` tag, and anything
  that must run a script has to initialise outside `astro:page-load`, since that
  event only fires if the router loaded.
- **Verify DNS against an authoritative resolver, not a plain `curl`.** A local
  resolver can serve stale answers long after propagation, which reads exactly like a
  failed host migration; cross-check two resolvers or use
  `curl --resolve <host>:443:<ip>`. A stalled ACME `authorization_created` is a DNS
  problem far more often than a GitHub one: rule out a restrictive `CAA` and stale
  `AAAA` first, then clear and re-add the custom domain to force a fresh
  authorization.
