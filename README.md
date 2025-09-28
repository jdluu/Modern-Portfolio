# Modern Web Portfolio

[View Live Portfolio](https://jluu.dev)

This portfolio is a concise presentation of my software engineering projects and skills, designed with a focus on performance and clean design. It is built with Astro.

[![Netlify Status](https://api.netlify.com/api/v1/badges/640139f3-99cf-4263-8334-f33ac202e7fd/deploy-status)](https://app.netlify.com/projects/jdluucs/deploys)

## Tech Stack

This project is built with the following technologies:

- Framework: Astro (islands architecture) + SolidJS for interactive islands
- Language: TypeScript ([tsconfig.json](tsconfig.json))
- Styling: Vanilla CSS with custom reset ([public/styles/reset.css](public/styles/reset.css))
- Content: Astro Content Collections ([src/content/config.ts](src/content/config.ts)) with Markdown posts
- Components: Astro .astro components + Solid TSX islands (example: [src/components/ui/ThemeToggleButton.tsx](src/components/ui/ThemeToggleButton.tsx))
- Fonts: Locally hosted Roboto Flex variable font (WOFF2) ([public/fonts/Roboto_Flex/RobotoFlex-VariableFont.woff2](public/fonts/Roboto_Flex/RobotoFlex-VariableFont.woff2))
- Icons: Inline SVG assets ([public/icons/](public/icons/))
- SEO/Meta: Robots and favicons ([public/robots.txt](public/robots.txt), [public/favicons/](public/favicons/))
- Hosting/Deploy: Netlify (custom headers via [public/\_headers](public/_headers))
- Package Manager: pnpm
