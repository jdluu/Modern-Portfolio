# Modern Portfolio

Source for [jluu.dev](https://jluu.dev), my personal site: project case studies,
work history, and coursework writing.

[![Deploy to GitHub Pages](https://github.com/jdluu/Modern-Portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/jdluu/Modern-Portfolio/actions/workflows/deploy.yml)

## What's on the site

| Route                 | Contents                                                            |
| --------------------- | ------------------------------------------------------------------- |
| `/`                   | Home, with featured projects, recent experience, and contact links  |
| `/about`              | Background, education, and coursework                               |
| `/work`               | Experience, with a detail page per role                             |
| `/blog`               | Writing and coursework archives, with a detail page per entry       |
| `/projects/<slug>`    | Project case study: role, technologies, background, process, impact |
| `/posts/<slug>`       | A single post, with a table of contents                             |
| `/experiences/<slug>` | A single role                                                       |
| `/contact`            | Contact form                                                        |
| `/404`                | Not found                                                           |

## Running it locally

Node 22 or later, and pnpm 11.

```sh
pnpm install
pnpm run dev        # http://127.0.0.1:4321
```

| Script               | Purpose                                                  |
| -------------------- | -------------------------------------------------------- |
| `pnpm run dev`       | Development server                                       |
| `pnpm run build`     | Static build into `dist/`                                |
| `pnpm run preview`   | Serve the built output on :4321                          |
| `pnpm run check`     | `astro check`, which validates content schemas and types |
| `pnpm run lint`      | ESLint                                                   |
| `pnpm run format`    | Prettier                                                 |
| `pnpm run knip`      | Find unused files, exports, and dependencies             |
| `pnpm run test:unit` | Vitest                                                   |
| `pnpm run test:e2e`  | Playwright, which builds and previews the site first     |

## Content is data, not markup

There are three content collections, defined in
[`src/content.config.ts`](src/content.config.ts):

| Collection  | Entries | Location                       |
| ----------- | ------- | ------------------------------ |
| Projects    | 15      | `src/content/projects/*.md`    |
| Experiences | 3       | `src/content/experiences/*.md` |
| Posts       | 2       | `src/content/posts/*.md`       |

Adding an entry means adding one Markdown file, nothing else. Frontmatter is
validated by a Zod schema at build time. Image fields are typed with Astro's
`image()`, so a path that does not resolve fails `pnpm run check` rather than
rendering broken. Set `draft: true` to keep an entry out of the build, or prefix
the filename with an underscore to exclude it from the collection.

Project prose lives in frontmatter fields (`background`, `solution`, `impact`,
`reflection`) rather than a Markdown body, which is why the project files have
empty bodies beneath their frontmatter.

## Tech stack

| Area              | Choice                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| Framework         | Astro 7, static output, every page prerendered by default                                        |
| Interactive parts | Solid.js islands, scoped to `src/components/**/*.tsx`                                            |
| Language          | TypeScript 6, extending `astro/tsconfigs/strict`, targeting ES2024                               |
| Styling           | Hand-written CSS: `reset`, `global`, `tokens`, `typography`, plus a sibling `.css` per component |
| Icons             | `astro-icon` with the Lucide set                                                                 |
| Images            | Astro's Sharp-based image service, sources under `src/assets/images/`                            |
| Markdown          | `@astrojs/markdown-remark` with `rehype-slug`                                                    |
| Fonts             | Roboto Flex variable font, self-hosted WOFF2                                                     |
| Sitemap           | `@astrojs/sitemap`                                                                               |
| Tests             | Vitest for unit, Playwright for end to end                                                       |
| Quality gates     | ESLint 10, Prettier 3, knip, husky with lint-staged, `pnpm audit --prod`                         |
| Hosting           | GitHub Pages, built and published from `main` by GitHub Actions                                  |

Pages ship as static HTML. JavaScript loads only for the components that need it,
which in practice means the filters, pagination, and theme toggle.

## Project layout

```
src/
  content.config.ts          collection schemas
  content/                   projects, experiences, posts (Markdown)
  layouts/BaseLayout.astro   the only layout; it renders <main>
  pages/                     one file per route
  components/
    cards/                   project and experience cards
    filters/                 filter and pagination islands (Solid)
    navigation/              navbar, footer, pagination
    sections/                homepage and page bands
    ui/  shared/  blog/
  hooks/  lib/  scripts/  styles/  types/
tests/
  unit/                      sort, table of contents, and utility helpers
  e2e/                       image, accessibility, and navigation sweeps
```

## Testing

Unit tests cover the sorting and table-of-contents helpers. The end-to-end suite
runs in Chromium and in a Pixel 5 viewport, and sweeps every page it discovers in
the sitemap rather than a hardcoded list, so a new page is covered automatically:

| Spec                 | Checks                                                                                                                                                            |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `images.spec.ts`     | Every image decodes and paints at a real size, no media or font request 404s, demo videos decode with a working poster, and lightboxes open onto full-size images |
| `a11y.spec.ts`       | axe-core WCAG 2.2 A and AA in both themes, plus document structure, unique ids, and skip-link behaviour                                                           |
| `navigation.spec.ts` | Every page reaches every other page, with real click-through and browser back and forward                                                                         |
| `home.spec.ts`       | Homepage-specific behaviour                                                                                                                                       |

## Accessibility

The site aims to meet WCAG 2.2 AA, and the end-to-end suite checks it on every
page in both light and dark themes. If you change colours, spacing, or markup,
that suite is what catches a regression. Two conventions worth knowing: the layout
already provides the `<main>` landmark, so pages must not add their own, and text
that should be hidden visually but remain available to screen readers uses the
`.visually-hidden` class.

## Deployment

Pushing to `main` triggers two independent workflows: `ci.yml` runs the full gate
suite, and `deploy.yml` runs a fast subset of those gates and then publishes
`dist/` to GitHub Pages. Deploy does not wait for CI, so a commit can be published
while its end-to-end run is still in flight.

Pages must be set to **GitHub Actions** as the build source, never "deploy from a
branch", and the custom domain `jluu.dev` is configured in the repository's
settings rather than in a `CNAME` file, because publishing from a workflow ignores
one.

## Contact form

The contact form posts client-side to [Web3Forms](https://web3forms.com), so there
is no backend. The access key in the markup is a public inbox alias and is
intentionally committed; it is not a secret.

## A note on the images

Each project carries three distinct images: a card thumbnail, a screenshot of the
app's home screen for the page hero, and a short recording of the app in use as the
demo. They are not interchangeable, and the convention is documented in
[`AGENTS.md`](AGENTS.md).
