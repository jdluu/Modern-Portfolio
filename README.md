# Modern Web Portfolio

[View Live Portfolio](https://jluu.dev)

This portfolio is a concise presentation of my software engineering projects and skills, designed with a focus on performance and clean design. It is built with Astro.

[![Deploy to GitHub Pages](https://github.com/jdluu/Modern-Portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/jdluu/Modern-Portfolio/actions/workflows/deploy.yml)

## Tech Stack

This project is built with the following technologies:

- Framework: Astro (islands architecture) + SolidJS for interactive islands
- Language: TypeScript ([tsconfig.json](tsconfig.json))
- Styling: Vanilla CSS with custom reset ([src/styles/reset.css](src/styles/reset.css))
- Content: Astro Content Collections ([src/content.config.ts](src/content.config.ts)) with Markdown posts
- Components: Astro .astro components + Solid TSX islands (example: [src/components/shared/ThemeToggleButton.tsx](src/components/shared/ThemeToggleButton.tsx))
- Fonts: Locally hosted Roboto Flex variable font (WOFF2) ([public/fonts/Roboto_Flex/RobotoFlex-VariableFont.woff2](public/fonts/Roboto_Flex/RobotoFlex-VariableFont.woff2))
- Icons: `astro-icon` with the Lucide icon set (`@iconify-json/lucide`)
- SEO/Meta: Robots and favicons ([public/robots.txt](public/robots.txt), [public/favicons/](public/favicons/))
- Hosting/Deploy: GitHub Pages, built and published from `main` by [.github/workflows/deploy.yml](.github/workflows/deploy.yml), served on the custom domain `jluu.dev`. The domain is set in the repository's **Settings → Pages** and is not tracked in this repo: publishing from a custom Actions workflow ignores a `CNAME` file.
- Contact form: [Web3Forms](https://web3forms.com) — a client-side POST to `https://api.web3forms.com/submit`, no backend. The access key is a public inbox alias, so it is intentionally in the markup.
- Package Manager: pnpm
