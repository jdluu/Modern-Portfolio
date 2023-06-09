# My Modern Web Portfolio

## Design Philosophy

For my portfolio, I decided to use Astro because of its content-focused, server first approach. Astro is optimized for performance and easy to use, using HTML, CSS, and JS syntax.

This portfolio was built off of the content from my original portfolio here: <https://github.com/jdluu/portfolio>

## 🚀 Project Structure

Inside my Astro project, you'll see the following folders and files:

```
/
├── public/
│   ├── assets/
│   |    └── Luu_Jeffrey_Resume.pdf
│   ├── images/
│   |    └── fractal.jpg
│   |    └── ms-icon-150x150.png
│   |    └── ms-icon-310x310.png
│   |    └── Placeholder.png
│   |    └── profile.webp
│   |    └── zooseekerwf.png
│   ├── scripts/
│   |    └── theme.js
│   └── favicon.ico
├── src/
│   ├── components/
│   |    ├── Navbar/
│   |    |    └── Navbar.css
│   |    |    └── Navbar.jsx
│   |    └── AboutPage.astro
│   |    └── BlogPost.astro
│   |    └── ContactPage.astro
│   |    └── ExperiencePage.astro
│   |    └── Footer.astro
│   |    └── Header.astro
│   |    └── IntroPage.astro
│   |    └── Projects.astro
│   |    ├── ProjectCard.astro
│   |    ├── ProjectCards.astro
│   ├── data/
│   |    └── site.json
│   ├── layouts/
│   │    └── DefaultLayout.astro
│   │    └── MarkdownPostLayout.astro
│   │    └── ProjectLayout.astro
│   └── pages/
│   |    ├── posts/
│   |    |    └── post-1.md
│   |    |    └── post-2.md
│   |    |    └── post-3.md
│   |    ├── projects/
│   |    |    └── project-1.md
│   |    |    └── project-2.md
│   |    |    └── project-3.md
│   |    |    └── project-4.md
│   |    |    └── project-5.md
│   |    |    └── project-6.md
│   |    └── about.astro
│   |    └── blog.astro
│   |    └── contact.astro
│   |    └── index.astro
│   |    └── work.astro
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
|:-----------------------|:-------------------------------------------------|
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## Deployment

[![Netlify Status](https://api.netlify.com/api/v1/badges/5b79e3ed-5748-4cbd-9609-a93a4967c79e/deploy-status)](https://app.netlify.com/sites/spectacular-basbousa-817044/deploys)
