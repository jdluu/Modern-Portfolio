# My Modern Web Portfolio

## Design Philosophy

For my portfolio, I decided to use Astro because of its content-focused, islands approach. Astro is optimized for performance and easy to use, using HTML, CSS, and JS syntax.

This portfolio was built off of the content from my original portfolio here: <https://github.com/jdluu/portfolio>

## 🚀 Project Structure

Inside my Astro project, you'll see the following folders and files:

```
├── public/
│   ├── assets/
│   |    └── Luu_Jeffrey_Resume.pdf
│   ├── icons/
│   |    └── email.svg
│   |    └── github.svg
│   |    └── home.svg
│   |    └── linkedin.svg
│   |    └── ms-icon-150x150.png
│   |    └── ms-icon-310x310.png
│   ├── images/
│   |    └── finalUB.png
│   |    └── finalWAD.png
│   |    └── finalZS.gif
│   |    └── fractal.jpg
│   |    └── homeUB.png
│   |    └── homeWAD.png
│   |    └── homeZS.png
│   |    └── placeholder.png
│   |    └── profile.webp
│   |    └── projectPlaceholder.png
│   |    └── thumbnailUB.png
│   |    └── thumbnailWAD.png
│   |    └── thumbnailZS.png
│   |    └── wireframeUB.png
│   |    └── wireframeWAD.png
│   |    └── wireframeZS.png
│   ├── scripts/
│   |    └── theme.js
│   └── favicon.ico
├── src/
│   ├── components/
│   |    └── AboutContent.astro
│   |    └── BlogPost.astro
│   |    └── ContactForm.astro
│   |    └── ExperienceContent.astro
│   |    └── Footer.astro
│   |    └── IntroContent.astro
│   |    └── MainHead.astro
│   |    └── Navbar.astro
│   |    ├── ProjectCard.astro
│   |    ├── ProjectCardGrid.astro
│   ├── layouts/
│   │    └── DefaultLayout.astro
│   │    └── BlogPostLayout.astro
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
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:3000`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |

## Deployment

[![Netlify Status](https://api.netlify.com/api/v1/badges/5b79e3ed-5748-4cbd-9609-a93a4967c79e/deploy-status)](https://app.netlify.com/sites/spectacular-basbousa-817044/deploys)
