# AGENTS.md: Modern Portfolio (jluu.dev)

Notes for AI agents working in this repo.

This is the only agent instruction file here. Fold new lessons into it instead of
adding per-tool config directories (`.agents/`, `.claude/`, `skills-lock.json`).

## Ground rules

- The **deployed site (jluu.dev) is the design source of truth.** Compare against
  the live pages before redesigning anything.
- Never invent stats, course codes, dates, or screenshots. On portfolio copy,
  vague-but-true beats impressive-but-fabricated.
- Content and asset changes are only done when `pnpm run check`, `pnpm run lint`,
  and `pnpm run build` pass, and the built page was actually inspected.

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

## Content writing rules

### Voice and tone

- Direct and understated. Plain facts, no hype. No "Advancing technology,
  empowering people" taglines, no "innovative and user-friendly experiences"
  filler in meta descriptions.
- First person where it fits. Project pages, About, and experience narratives
  use "I" naturally.
- Specific over abstract. Name the framework, the problem, what broke, and what
  you would do differently.
- Reflections mention actual difficulties, not vague learning outcomes.

### Fact rules for portfolio copy

- **Trace projects to their origin.** Say which course or program, e.g. "built
  through CodePath's Android course" or "final project of COGS 108 (Data Science
  in Practice) at UCSD". A course-born project that reads as a standalone
  personal project is a gap.
- **State student-to-instructor arcs.** e.g. "Returned to CodePath as an
  instructor after completing the same Android course as a student in 2021."
- **Verify course numbers against the transcript.** When in doubt, ask. A wrong
  course code erodes credibility.
- **No unverifiable stats.** Drop "accepted 95% of reviews" or "improved
  throughput by 20%" unless the user supplied the number. Replace with concrete
  but defensible phrasing.
- **Directed Research and Thesis are usually different projects.** Confirm they
  are distinct before writing copy that treats them as one.
- **Verify graduation dates with the user.** Never assume "expected 2026";
  thesis timelines shift.

### AI-tell audit (mandatory after writing portfolio copy)

1. **Em dashes.** The #1 modern tell. Replace with periods, colons, commas, or
   parentheses. Only legitimate date ranges survive (Oct 22–27). Both the
   `humanizer` skill (pattern 14) and `design-taste-frontend` treat this as a
   binary ban, so verify `—` and `–` are absent before finishing.
2. **"Not X but Y" / "rather than".** State it directly instead.
3. **Forced groups of three.** Real enumerations (course lists, tech stacks)
   are fine. Rhetorical tricolons are not.
4. **Dramatic fragments and punchline stacking.** "No cloud. No cables." reads
   as performed. Fold it back into a real sentence with a subject.
5. **Copula avoidance.** "serves as", "stands as", "represents a" become "is"
   or "has".
6. **AI vocabulary.** delve, tapestry, underscore, showcase, pivotal, intricate,
   landscape (abstract), seamless, robust, leverage, utilize, meticulous,
   passionate, cutting-edge.
7. **Hedge stacks.** "could potentially possibly" becomes "may".
8. **Curly quotes and emoji-decorated headings.**

### Audit procedure

1. Scan for decorative em dashes and eliminate them.
2. Scan for not-X-but-Y, rather-than, and rule-of-three.
3. Scan for AI vocabulary and hedge stacks.
4. Read it aloud. Does it sound like Jeffrey?
5. Re-run the project's own checks, then tell the user a human skim is still
   worthwhile. Regex catches patterns, not rhythm.

Killing AI vocabulary while keeping AI _structure_ (fragment endings, forced
tricolons, stacked short sentences) just produces subtler slop. Audit the
structure, not only the word list.

### Project page structure

Vary paragraph structure, but cover why you built it, what it does, what was
hard, where it came from (course or program), and what you would change.

### Experience page bullets

Drop unverifiable percentages and "meticulous" adjectives. Describe the actual
day-to-day work. Highlight arcs (student → instructor).

### Coursework archive posts

Dense course lists need explicit CSS care:

- Section headings get a subtle bottom border.
- `.prose ul { list-style: revert; }`, because `reset.css` strips list styles
  from Astro post markdown.
- Course codes are bolded with a `min-width` so the column scans vertically.
- Appendix table: rounded corners, outer border, zebra striping, generous
  padding, hover state.
- Content column max-width around 70ch. TOC sidebar width uses `clamp()`, never
  a fixed value.
- About chips: 6 courses max per degree. Pick the ones that tell the story.

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
  copy stays at `var(--step-0)`. Bumping narrative text to step-2 or step-3
  looks disproportionate.

## Media conventions

- `final_<name>.png` in a project asset directory is the still shown in the
  Final Product section, and doubles as the demo video poster.
- `final_<name>.mp4` and `final_<name>.webm` (same basename) are the recorded
  demo. When either exists, `src/pages/projects/[slug].astro` renders a
  `<video>` (webm first, mp4 fallback) with the still as its poster, and skips
  the lightbox. Astro has no video pipeline, so the sources come from an eager
  `import.meta.glob`; image sources go through `getImage` and `Image`.
- `final_<name>.gif` is not used anywhere. Content entries point at
  `final_<name>.png`; never add a GIF reference to satisfy the schema.
- **Never commit placeholder media.** A 67-byte stub GIF renders as an 8x8
  figure in the Final Product section, and the build ships it without complaint.
- Original GIF masters live in `assets-demo-masters/` and are intentionally kept
  out of the deployed output. Re-encode from there if needed.
- `thumbnail_<name>.min.png` is the card image, distinct from `cover_<name>.*`,
  which is the hero. Keep both.

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
- `README.md` drifts. It still references `src/content/config.ts` (the real file
  is `src/content.config.ts`), `public/styles/reset.css`, and `public/icons/`,
  none of which exist. Icons come from `astro-icon`.
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

## References

- `humanizer` skill (`skill_view(name='humanizer')`) for the full 34-pattern
  checklist of AI writing tells.
- `design-taste-frontend` skill for frontend layout and taste review.
- `assets-demo-masters/README.md` for demo media masters.
