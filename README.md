# My Modern Web Portfolio

## Design Philosophy
For this portfolio, I focused more on making resuable components, making my website modular and easy to update. I am using Astro and minimizing Javascript to maintain a balance between interactivity and speed.

The main content for this portoflio is taken from my original portfolio which is here: https://github.com/jdluu/portfolio


## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

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
│   └── favicon.ico
├── src/
│   ├── components/
│   |    └── About.astro
│   |    └── Contact.astro
│   |    └── Experience.astro
│   |    └── Footer.astro
│   |    └── Header.astro
│   |    └── Intro.astro
│   |    └── Projects.astro
│   |    ├── Navbar/
│   |    |    └── Navbar.css
│   |    |    └── Navbar.jsx
│   |    ├── Temp/
│   |    |    └── Card.astro
│   ├── data/
│   |    └── site.json
│   ├── layouts/
│   │    └── BaseLayout.astro
│   │    └── MarkdownPostLayout.astro
│   └── pages/
│   |    ├── posts/
│   |    |    └── post-1.md
│   |    ├── projects/
│   |    └── index.astro
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
